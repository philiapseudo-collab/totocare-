import { supabase } from "@/integrations/supabase/client";

export class MedicationNotificationService {
  private static instance: MedicationNotificationService;
  private checkInterval: number | null = null;
  private audioContext: AudioContext | null = null;
  private hasUserInteraction: boolean = false;

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


  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
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

  private playAlarmSound() {
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

  async showNotification(medication: any) {
    const hasPermission = await this.requestNotificationPermission();
    
    if (hasPermission) {
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

  startMonitoring(profileId: string) {
    // Check immediately
    this.checkDueMedications(profileId);

    // Check every minute
    this.checkInterval = window.setInterval(() => {
      this.checkDueMedications(profileId);
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
