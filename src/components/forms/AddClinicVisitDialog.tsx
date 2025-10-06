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

interface AddClinicVisitDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddClinicVisitDialog({ trigger, onSuccess }: AddClinicVisitDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    visit_date: "",
    visit_type: "",
    blood_pressure: "",
    weight: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.visit_date || !formData.visit_type) {
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

      const { error } = await supabase.from('clinic_visits').insert({
        patient_id: profile.id,
        visit_date: formData.visit_date,
        visit_type: formData.visit_type,
        status: 'scheduled',
        blood_pressure: formData.blood_pressure || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        notes: formData.notes || null
      });

      if (error) throw error;

      toast.success("Clinic visit added successfully");
      setFormData({ visit_date: "", visit_type: "", blood_pressure: "", weight: "", notes: "" });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to add clinic visit");
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
          <DialogTitle>Add Clinic Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visit_type">Visit Type *</Label>
            <Select value={formData.visit_type} onValueChange={(value) => setFormData(prev => ({ ...prev, visit_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select visit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Antenatal checkup">Antenatal Checkup</SelectItem>
                <SelectItem value="Postnatal checkup">Postnatal Checkup</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                <SelectItem value="Blood test">Blood Test</SelectItem>
                <SelectItem value="General consultation">General Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit_date">Visit Date *</Label>
            <Input
              id="visit_date"
              type="date"
              value={formData.visit_date}
              onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="blood_pressure">Blood Pressure</Label>
              <Input
                id="blood_pressure"
                value={formData.blood_pressure}
                onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure: e.target.value }))}
                placeholder="e.g., 120/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="e.g., 65.5"
              />
            </div>
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
              {loading ? "Adding..." : "Add Visit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
