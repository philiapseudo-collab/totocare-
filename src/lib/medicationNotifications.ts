import { supabase } from "@/integrations/supabase/client";

export class MedicationNotificationService {
  private static instance: MedicationNotificationService;
  private checkInterval: number | null = null;
  private audio: HTMLAudioElement | null = null;

  private constructor() {
    this.audio = new Audio();
    // Using a simple sine wave tone as alarm sound
    this.createAlarmSound();
  }

  static getInstance(): MedicationNotificationService {
    if (!MedicationNotificationService.instance) {
      MedicationNotificationService.instance = new MedicationNotificationService();
    }
    return MedicationNotificationService.instance;
  }

  private createAlarmSound() {
    // Create a simple alarm tone using Web Audio API
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 800; // 800 Hz tone
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
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
    if (this.audio) {
      try {
        // Create beeping pattern
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playBeep = () => {
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          
          oscillator.start(context.currentTime);
          oscillator.stop(context.currentTime + 0.3);
        };

        // Play 5 beeps
        for (let i = 0; i < 5; i++) {
          setTimeout(() => playBeep(), i * 500);
        }
      } catch (error) {
        console.error("Error playing alarm sound:", error);
      }
    }
  }

  private stopAlarmSound() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
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
        this.stopAlarmSound();
      };

      // Auto-close after 30 seconds
      setTimeout(() => {
        notification.close();
        this.stopAlarmSound();
      }, 30000);
    }
  }

  async checkDueMedications(profileId: string) {
    try {
      const { data, error } = await supabase.rpc("get_due_medication_reminders", {
        user_profile_id: profileId,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        for (const medication of data) {
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
    this.stopAlarmSound();
  }
}

export const medicationNotificationService = MedicationNotificationService.getInstance();
