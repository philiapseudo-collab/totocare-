import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AddVaccinationDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddVaccinationDialog({ trigger, onSuccess }: AddVaccinationDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vaccine_name: "",
    scheduled_date: "",
    patient_type: "mother",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.vaccine_name || !formData.scheduled_date) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      const { error } = await supabase.from('vaccinations').insert({
        patient_id: profile.id,
        vaccine_name: formData.vaccine_name,
        scheduled_date: formData.scheduled_date,
        status: 'due',
        patient_type: formData.patient_type,
        notes: formData.notes || null
      });

      if (error) throw error;

      toast.success("Vaccination added successfully");
      setFormData({ vaccine_name: "", scheduled_date: "", patient_type: "mother", notes: "" });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to add vaccination");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Vaccination</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vaccine_name">Vaccine Name *</Label>
            <Input
              id="vaccine_name"
              value={formData.vaccine_name}
              onChange={(e) => setFormData(prev => ({ ...prev, vaccine_name: e.target.value }))}
              placeholder="e.g., Tdap, Hepatitis B"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Scheduled Date *</Label>
            <Input
              id="scheduled_date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient_type">For *</Label>
            <Select value={formData.patient_type} onValueChange={(value) => setFormData(prev => ({ ...prev, patient_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="infant">Infant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Vaccination"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
