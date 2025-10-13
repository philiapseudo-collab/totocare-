import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Pill, Bell } from "lucide-react";
import { inAppAlertService, type MedicationAlert } from "@/lib/inAppAlerts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { medicationNotificationService } from "@/lib/medicationNotifications";

export const MedicationAlertModal = () => {
  const [currentAlert, setCurrentAlert] = useState<MedicationAlert | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleAlert = (alert: MedicationAlert) => {
      setCurrentAlert(alert);
      setIsOpen(true);
      medicationNotificationService.playAlarmSound();
    };

    inAppAlertService.setAlertCallback(handleAlert);
  }, []);

  const handleTakeNow = async () => {
    if (!currentAlert) return;
    
    toast.success("✅ Medication marked as taken");
    inAppAlertService.dismissAlert(currentAlert.id);
    setIsOpen(false);
    setCurrentAlert(null);
  };

  const handleSnooze = async () => {
    if (!currentAlert) return;

    const snoozeUntil = new Date();
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + 10);

    const { error } = await supabase
      .from("medications")
      .update({ snooze_until: snoozeUntil.toISOString() })
      .eq("id", currentAlert.medicationId);

    if (error) {
      toast.error("Failed to snooze reminder");
    } else {
      toast.success("⏰ Reminder snoozed for 10 minutes");
      inAppAlertService.dismissAlert(currentAlert.id);
      setIsOpen(false);
      setCurrentAlert(null);
    }
  };

  const handleSkip = () => {
    if (!currentAlert) return;
    
    toast.info("Medication reminder skipped");
    inAppAlertService.dismissAlert(currentAlert.id);
    setIsOpen(false);
    setCurrentAlert(null);
  };

  if (!currentAlert) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-full">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            Time to Take Medication
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medication</p>
                <p className="text-lg font-semibold text-foreground">{currentAlert.medicationName}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dosage</p>
                <Badge variant="secondary" className="text-sm">
                  {currentAlert.dosage}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Scheduled Time</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="h-4 w-4" />
                  {currentAlert.reminderTime}
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
              <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Browser notifications are currently unavailable. Please interact with this alert.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleTakeNow} className="w-full" size="lg">
            ✅ I Took It
          </Button>
          <div className="flex gap-2 w-full">
            <Button onClick={handleSnooze} variant="secondary" className="flex-1">
              ⏰ Snooze 10 min
            </Button>
            <Button onClick={handleSkip} variant="outline" className="flex-1">
              Skip
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
