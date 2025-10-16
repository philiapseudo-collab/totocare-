import { useState, useEffect } from "react";
import { Plus, Bell, Clock, Pill, ExternalLink, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMedications } from "@/hooks/useMedications";
import { AddMedicationDialog } from "@/components/forms/AddMedicationDialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isEmbeddedContext } from "@/lib/utils";

const Medications = () => {
  const { medications, loading, refetch } = useMedications();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(isEmbeddedContext());
  }, []);

  const openInNewTab = () => {
    window.open(window.location.href, "_blank", "noopener,noreferrer");
  };

  const handleSnooze = async (medicationId: string) => {
    const snoozeUntil = new Date();
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + 10); // Snooze for 10 minutes

    const { error } = await supabase
      .from("medications")
      .update({ snooze_until: snoozeUntil.toISOString() })
      .eq("id", medicationId);

    if (error) {
      toast.error("Failed to snooze reminder");
    } else {
      toast.success("⏰ Reminder snoozed for 10 minutes");
      refetch();
    }
  };

  const handleToggleNotification = async (medicationId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("medications")
      .update({ notification_enabled: !currentStatus })
      .eq("id", medicationId);

    if (error) {
      toast.error("Failed to update notification settings");
    } else {
      toast.success(currentStatus ? "🔕 Notifications disabled" : "🔔 Notifications enabled");
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="h-8 bg-muted animate-pulse rounded mb-6" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-muted animate-pulse rounded mb-4" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Embedded Context Warning */}
      {embedded && (
        <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertTitle>Limited Functionality in Preview Mode</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Browser notifications are restricted in embedded previews. For full notification support, open this page in a new tab.
            </p>
            <div className="flex gap-2">
              <Button onClick={openInNewTab} variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button onClick={() => window.location.href = '/notification-settings'} variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                Notification Settings
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6" />
            💊 Medication Reminders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage medications and set reminder times
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/medication-analytics'}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/notification-settings'}>
            <Bell className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {medications && medications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Pill className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No medications yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first medication to start receiving reminders
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {medications?.map((medication: any) => (
            <Card key={medication.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      💊 {medication.medication_name}
                      {medication.notification_enabled ? (
                        <Badge variant="default">🔔 Active</Badge>
                      ) : (
                        <Badge variant="secondary">🔕 Paused</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <strong>Dosage:</strong> {medication.dosage} • <strong>Frequency:</strong> {medication.frequency}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleNotification(medication.id, medication.notification_enabled)}
                    >
                      {medication.notification_enabled ? "🔕 Disable" : "🔔 Enable"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMedication(medication);
                        setAddDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">📅 Duration:</p>
                    <p className="text-sm">
                      {format(new Date(medication.start_date), "MMM dd, yyyy")} - 
                      {medication.end_date ? format(new Date(medication.end_date), "MMM dd, yyyy") : "Ongoing"}
                    </p>
                  </div>

                  {medication.reminder_times && medication.reminder_times.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">⏰ Reminder Times:</p>
                      <div className="flex flex-wrap gap-2">
                        {medication.reminder_times.map((reminder: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reminder.time}
                            {reminder.days && (
                              <span className="text-xs ml-1">
                                ({reminder.days.length === 7 ? "Daily" : `${reminder.days.length} days/week`})
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {medication.snooze_until && new Date(medication.snooze_until) > new Date() && (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      ⏰ Snoozed until {format(new Date(medication.snooze_until), "h:mm a")}
                    </Badge>
                  )}

                  {medication.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">📝 Notes:</p>
                      <p className="text-sm">{medication.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSnooze(medication.id)}
                      disabled={!medication.notification_enabled}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Snooze 10 min
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddMedicationDialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditingMedication(null);
        }}
        medication={editingMedication}
        onSuccess={() => {
          refetch();
          setEditingMedication(null);
        }}
      />
    </div>
  );
};

export default Medications;
