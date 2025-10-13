import { toast } from "sonner";

export interface MedicationAlert {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  reminderTime: string;
  timestamp: Date;
}

type AlertCallback = (alert: MedicationAlert) => void;

class InAppAlertService {
  private static instance: InAppAlertService;
  private alertCallback: AlertCallback | null = null;
  private activeAlerts: Map<string, MedicationAlert> = new Map();

  private constructor() {}

  static getInstance(): InAppAlertService {
    if (!InAppAlertService.instance) {
      InAppAlertService.instance = new InAppAlertService();
    }
    return InAppAlertService.instance;
  }

  setAlertCallback(callback: AlertCallback) {
    this.alertCallback = callback;
  }

  showAlert(medication: any) {
    const alert: MedicationAlert = {
      id: `${medication.medication_id}-${Date.now()}`,
      medicationId: medication.medication_id,
      medicationName: medication.medication_name,
      dosage: medication.dosage,
      reminderTime: medication.reminder_time,
      timestamp: new Date(),
    };

    this.activeAlerts.set(alert.id, alert);

    // Show toast notification
    toast.error(`💊 Time to take ${medication.medication_name}`, {
      description: `Dosage: ${medication.dosage} at ${medication.reminder_time}`,
      duration: 30000,
      action: {
        label: "View",
        onClick: () => {
          if (this.alertCallback) {
            this.alertCallback(alert);
          }
        },
      },
    });

    // Trigger callback for modal display
    if (this.alertCallback) {
      this.alertCallback(alert);
    }
  }

  dismissAlert(alertId: string) {
    this.activeAlerts.delete(alertId);
  }

  getActiveAlerts(): MedicationAlert[] {
    return Array.from(this.activeAlerts.values());
  }
}

export const inAppAlertService = InAppAlertService.getInstance();
