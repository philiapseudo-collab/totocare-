import { supabase } from "@/integrations/supabase/client";
import { isEmbeddedContext } from "@/lib/utils";
import { inAppAlertService } from "@/lib/inAppAlerts";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications, getServiceWorkerRegistration, sendMessageToServiceWorker } from "@/lib/serviceWorkerRegistration";
import { saveMedicationsToCache, logMedicationAction as logToIndexedDB, getUnsyncedActions } from "@/lib/db/medicationDB";

export class MedicationNotificationService {
  private static instance: MedicationNotificationService;
  private checkInterval: number | null = null;
  private audioContext: AudioContext | null = null;
  private hasUserInteraction: boolean = false;
  private pushSubscription: PushSubscription | null = null;

  private constructor() {
    // Wait for user interaction before creating audio context
    this.setupUserInteraction();
  }

  private setupUserInteraction() {
    const initAudio = () => {
      if (!this.hasUserInteraction) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.hasUserInteraction = true;
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
      }
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
  }

  static getInstance(): MedicationNotificationService {
    if (!MedicationNotificationService.instance) {
      MedicationNotificationService.instance = new MedicationNotificationService();
    }
    return MedicationNotificationService.instance;
  }


  async setupPushNotifications(): Promise<boolean> {
    try {
      // First ensure we have notification permission
      const hasPermission = await this.requestNotificationPermission();
      if (!hasPermission) {
        return false;
      }

      // Subscribe to push notifications
      this.pushSubscription = await subscribeToPushNotifications();
      if (!this.pushSubscription) {
        console.warn("Failed to subscribe to push notifications");
        return false;
      }

      // Save subscription to database
      const { error } = await supabase
        .from("push_subscriptions")
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          subscription: this.pushSubscription.toJSON(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error saving push subscription:", error);
        return false;
      }

      console.log("Push notifications setup successfully");
      return true;
    } catch (error) {
      console.error("Error setting up push notifications:", error);
      return false;
    }
  }

  async disablePushNotifications(): Promise<boolean> {
    try {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        this.pushSubscription = null;
        
        // Remove subscription from database
        const { error } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

        if (error) {
          console.error("Error removing push subscription:", error);
        }
      }
      return success;
    } catch (error) {
      console.error("Error disabling push notifications:", error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    // Check if embedded - cannot request permissions in iframe
    if (isEmbeddedContext()) {
      console.warn("Cannot request notification permission in embedded context (iframe)");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  getEnvironmentInfo() {
    return {
      embedded: isEmbeddedContext(),
      browser: this.getBrowserName(),
      notificationPermission: "Notification" in window ? Notification.permission : "unavailable",
      notificationSupported: "Notification" in window,
    };
  }

  playAlarmSound() {
    if (!this.audioContext || !this.hasUserInteraction) {
      console.warn("Cannot play alarm sound - waiting for user interaction");
      return;
    }

    try {
      const playBeep = (delay: number) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        const startTime = this.audioContext!.currentTime + delay;
        gainNode.gain.setValueAtTime(0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      };

      // Play 5 beeps with 500ms intervals
      for (let i = 0; i < 5; i++) {
        playBeep(i * 0.5);
      }
    } catch (error) {
      console.error("Error playing alarm sound:", error);
    }
  }

  testAlarmSound() {
    console.log("Testing alarm sound...");
    this.playAlarmSound();
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  getBrowserName(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) return "Chrome";
    if (userAgent.includes("firefox")) return "Firefox";
    if (userAgent.includes("safari") && !userAgent.includes("chrome")) return "Safari";
    if (userAgent.includes("edg")) return "Edge";
    return "your browser";
  }

  async showNotification(medication: any) {
    const envInfo = this.getEnvironmentInfo();
    
    // If embedded or no permission, use fallback alert system
    if (envInfo.embedded || envInfo.notificationPermission !== "granted") {
      console.log("Using fallback in-app alert system");
      inAppAlertService.showAlert(medication);
      this.playAlarmSound();
      return;
    }

    // Try to show browser notification
    try {
      const notification = new Notification("💊 Medication Reminder", {
        body: `Time to take ${medication.medication_name} (${medication.dosage})`,
        icon: "/placeholder.svg",
        badge: "/placeholder.svg",
        tag: medication.id,
        requireInteraction: true,
      });

      this.playAlarmSound();

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => {
        notification.close();
      }, 30000);
    } catch (error) {
      console.error("Failed to show notification, using fallback:", error);
      inAppAlertService.showAlert(medication);
      this.playAlarmSound();
    }
  }

  async checkDueMedications(profileId: string) {
    try {
      console.log(`[${new Date().toLocaleTimeString()}] Checking due medications for profile: ${profileId}`);
      
      const { data, error } = await supabase.rpc("get_due_medication_reminders", {
        user_profile_id: profileId,
      });

      if (error) {
        console.error("Error fetching due medications:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} due medication(s)`);

      if (data && data.length > 0) {
        for (const medication of data) {
          console.log(`Triggering notification for: ${medication.medication_name} at ${medication.reminder_time}`);
          await this.showNotification(medication);
          
          // Update last_notified_at
          await supabase
            .from("medications")
            .update({ last_notified_at: new Date().toISOString() })
            .eq("id", medication.medication_id);
        }
      }
    } catch (error) {
      console.error("Error checking due medications:", error);
    }
  }

  async syncMedicationsToCache(profileId: string) {
    try {
      const { data: medications, error } = await supabase
        .from("medications")
        .select("*")
        .eq("patient_id", profileId)
        .eq("is_active", true);

      if (error) throw error;

      if (medications) {
        await saveMedicationsToCache(medications);
        
        // Also sync to service worker
        const registration = await getServiceWorkerRegistration();
        if (registration && registration.active) {
          await sendMessageToServiceWorker({
            type: "UPDATE_MEDICATIONS",
            medications: medications,
          });
        }
      }
    } catch (error) {
      console.error("Error syncing medications to cache:", error);
    }
  }

  async syncUnsyncedActions() {
    try {
      const unsyncedActions = await getUnsyncedActions();
      
      if (unsyncedActions.length === 0) {
        return;
      }

      console.log(`Syncing ${unsyncedActions.length} unsynced actions`);

      // TODO: Send to backend when medication_logs table is created in Phase 3
      // For now, just log them
      for (const action of unsyncedActions) {
        console.log("Unsynced action:", action);
      }
    } catch (error) {
      console.error("Error syncing unsynced actions:", error);
    }
  }

  startMonitoring(profileId: string) {
    // Sync medications to cache
    this.syncMedicationsToCache(profileId);

    // Check immediately
    this.checkDueMedications(profileId);

    // Check every minute
    this.checkInterval = window.setInterval(() => {
      this.checkDueMedications(profileId);
      this.syncUnsyncedActions();
    }, 60000); // 60 seconds
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const medicationNotificationService = MedicationNotificationService.getInstance();
