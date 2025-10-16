import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Pill, Bell, ChevronDown } from "lucide-react";
import { inAppAlertService, type MedicationAlert } from "@/lib/inAppAlerts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { medicationNotificationService } from "@/lib/medicationNotifications";
import { logMedicationAction } from "@/lib/db/medicationDB";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const MedicationAlertModal = () => {
  const [currentAlert, setCurrentAlert] = useState<MedicationAlert | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    const handleAlert = (alert: MedicationAlert) => {
      setCurrentAlert(alert);
      setIsOpen(true);
      medicationNotificationService.playAlarmSound();
    };

    inAppAlertService.setAlertCallback(handleAlert);
  }, []);

  const handleTakeNow = async () => {
    if (!currentAlert || isLogging) return;
    
    setIsLogging(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log to Supabase for analytics
      if (user) {
        await supabase.from('medication_actions').insert({
          medication_id: currentAlert.medicationId,
          user_id: user.id,
          action_type: 'taken',
          scheduled_time: new Date().toISOString(),
          action_time: new Date().toISOString(),
          notes: `Taken at scheduled time: ${currentAlert.reminderTime}`
        });
      }

      // Also log to IndexedDB for offline support
      await logMedicationAction({
        medication_id: currentAlert.medicationId,
        status: 'taken',
        timestamp: new Date().toISOString(),
        notes: `Taken at scheduled time: ${currentAlert.reminderTime}`
      });

      toast.success("✅ Medication marked as taken");
      inAppAlertService.dismissAlert(currentAlert.id);
      setIsOpen(false);
      setCurrentAlert(null);
    } catch (error) {
      console.error("Error logging medication:", error);
      toast.error("Failed to log medication, but marked as taken");
    } finally {
      setIsLogging(false);
    }
  };

  const handleSnooze = async (minutes: number) => {
    if (!currentAlert || isLogging) return;

    setIsLogging(true);
    try {
      const snoozeUntil = new Date();
      snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);

      const { error } = await supabase
        .from("medications")
        .update({ snooze_until: snoozeUntil.toISOString() })
        .eq("id", currentAlert.medicationId);

      if (error) {
        toast.error("Failed to snooze reminder");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Log to Supabase for analytics
      if (user) {
        await supabase.from('medication_actions').insert({
          medication_id: currentAlert.medicationId,
          user_id: user.id,
          action_type: 'snoozed',
          scheduled_time: new Date().toISOString(),
          action_time: new Date().toISOString(),
          notes: `Snoozed for ${minutes} minutes until ${snoozeUntil.toLocaleTimeString()}`
        });
      }

      // Also log to IndexedDB
      await logMedicationAction({
        medication_id: currentAlert.medicationId,
        status: 'snoozed',
        timestamp: new Date().toISOString(),
        notes: `Snoozed for ${minutes} minutes until ${snoozeUntil.toLocaleTimeString()}`
      });

      toast.success(`⏰ Reminder snoozed for ${minutes} minutes`);
      inAppAlertService.dismissAlert(currentAlert.id);
      setIsOpen(false);
      setCurrentAlert(null);
    } catch (error) {
      console.error("Error snoozing medication:", error);
      toast.error("Failed to snooze reminder");
    } finally {
      setIsLogging(false);
    }
  };

  const handleSkip = async () => {
    if (!currentAlert || isLogging) return;
    
    setIsLogging(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log to Supabase for analytics
      if (user) {
        await supabase.from('medication_actions').insert({
          medication_id: currentAlert.medicationId,
          user_id: user.id,
          action_type: 'skipped',
          scheduled_time: new Date().toISOString(),
          action_time: new Date().toISOString(),
          notes: `Skipped scheduled time: ${currentAlert.reminderTime}`
        });
      }

      // Also log to IndexedDB
      await logMedicationAction({
        medication_id: currentAlert.medicationId,
        status: 'skipped',
        timestamp: new Date().toISOString(),
        notes: `Skipped scheduled time: ${currentAlert.reminderTime}`
      });

      toast.info("Medication reminder skipped");
      inAppAlertService.dismissAlert(currentAlert.id);
      setIsOpen(false);
      setCurrentAlert(null);
    } catch (error) {
      console.error("Error logging skip:", error);
      toast.info("Medication reminder skipped");
    } finally {
      setIsLogging(false);
    }
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
          <Button 
            onClick={handleTakeNow} 
            className="w-full" 
            size="lg"
            disabled={isLogging}
          >
            ✅ I Took It
          </Button>
          <div className="flex gap-2 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  disabled={isLogging}
                >
                  ⏰ Snooze <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => handleSnooze(5)}>
                  5 minutes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(10)}>
                  10 minutes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(15)}>
                  15 minutes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(30)}>
                  30 minutes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(60)}>
                  1 hour
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={handleSkip} 
              variant="outline" 
              className="flex-1"
              disabled={isLogging}
            >
              Skip
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
