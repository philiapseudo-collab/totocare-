import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

interface AddMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: any;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 7 },
];

export const AddMedicationDialog = ({ open, onOpenChange, medication, onSuccess }: AddMedicationDialogProps) => {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    start_date: new Date(),
    end_date: null as Date | null,
    notes: "",
    notification_enabled: true,
  });
  const [reminderTimes, setReminderTimes] = useState<Array<{ time: string; days: number[] }>>([
    { time: "08:00", days: [1, 2, 3, 4, 5, 6, 7] }
  ]);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  useEffect(() => {
    if (medication) {
      setFormData({
        medication_name: medication.medication_name || "",
        dosage: medication.dosage || "",
        frequency: medication.frequency || "",
        start_date: new Date(medication.start_date),
        end_date: medication.end_date ? new Date(medication.end_date) : null,
        notes: medication.notes || "",
        notification_enabled: medication.notification_enabled ?? true,
      });
      setReminderTimes(medication.reminder_times && medication.reminder_times.length > 0 
        ? medication.reminder_times 
        : [{ time: "08:00", days: [1, 2, 3, 4, 5, 6, 7] }]);
    } else {
      setFormData({
        medication_name: "",
        dosage: "",
        frequency: "",
        start_date: new Date(),
        end_date: null,
        notes: "",
        notification_enabled: true,
      });
      setReminderTimes([{ time: "08:00", days: [1, 2, 3, 4, 5, 6, 7] }]);
    }
  }, [medication]);

  const handleAddReminderTime = () => {
    setReminderTimes([...reminderTimes, { time: "08:00", days: [1, 2, 3, 4, 5, 6, 7] }]);
  };

  const handleRemoveReminderTime = (index: number) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(reminderTimes.filter((_, i) => i !== index));
    }
  };

  const handleReminderTimeChange = (index: number, time: string) => {
    const newTimes = [...reminderTimes];
    newTimes[index] = { ...newTimes[index], time };
    setReminderTimes(newTimes);
  };

  const toggleDay = (index: number, day: number) => {
    const newTimes = [...reminderTimes];
    const days = newTimes[index].days;
    if (days.includes(day)) {
      newTimes[index] = { ...newTimes[index], days: days.filter((d) => d !== day) };
    } else {
      newTimes[index] = { ...newTimes[index], days: [...days, day].sort() };
    }
    setReminderTimes(newTimes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setLoading(true);
    try {
      const medicationData = {
        ...formData,
        patient_id: profile.id,
        reminder_times: reminderTimes,
        start_date: format(formData.start_date, "yyyy-MM-dd"),
        end_date: formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : null,
      };

      if (medication) {
        const { error } = await supabase
          .from("medications")
          .update(medicationData)
          .eq("id", medication.id);

        if (error) throw error;
        toast.success("💊 Medication updated successfully");
      } else {
        const { error } = await supabase
          .from("medications")
          .insert(medicationData);

        if (error) throw error;
        toast.success("💊 Medication added successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving medication:", error);
      toast.error(error.message || "Failed to save medication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {medication ? "Edit Medication" : "Add New Medication"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medication_name">💊 Medication Name *</Label>
            <Input
              id="medication_name"
              value={formData.medication_name}
              onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">💉 Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g., 500mg"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">📅 Frequency *</Label>
              <Input
                id="frequency"
                placeholder="e.g., Twice daily"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>📆 Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.start_date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => date && setFormData({ ...formData, start_date: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>📆 End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date || undefined}
                    onSelect={(date) => setFormData({ ...formData, end_date: date || null })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-3 border rounded-lg p-4">
            <Label>⏰ Reminder Times *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Set specific times to receive medication reminders
            </p>
            
            {/* Quick Presets */}
            <div className="flex gap-2 mb-3 flex-wrap">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReminderTimes([
                    { time: "08:00", days: [1, 2, 3, 4, 5, 6, 7] }
                  ]);
                }}
              >
                Once Daily
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReminderTimes([
                    { time: "08:00", days: [1, 2, 3, 4, 5, 6, 7] },
                    { time: "20:00", days: [1, 2, 3, 4, 5, 6, 7] }
                  ]);
                }}
              >
                Twice Daily
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReminderTimes([
                    { time: "08:00", days: [1, 2, 3, 4, 5, 6, 7] },
                    { time: "14:00", days: [1, 2, 3, 4, 5, 6, 7] },
                    { time: "20:00", days: [1, 2, 3, 4, 5, 6, 7] }
                  ]);
                }}
              >
                Three Times Daily
              </Button>
            </div>

            <div className="space-y-2">
              {reminderTimes.map((reminder, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2 bg-muted/30">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={reminder.time}
                      onChange={(e) => handleReminderTimeChange(index, e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveReminderTime(index)}
                      disabled={reminderTimes.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Repeat on:</p>
                    <div className="flex flex-wrap gap-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          variant={reminder.days.includes(day.value) ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-10"
                          onClick={() => toggleDay(index, day.value)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddReminderTime}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Time
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={formData.notification_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, notification_enabled: checked })}
            />
            <Label htmlFor="notifications">🔔 Enable Notifications</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">📝 Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : medication ? "Update" : "Add"} Medication
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
