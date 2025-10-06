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

interface AddScreeningDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddScreeningDialog({ trigger, onSuccess }: AddScreeningDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    screening_type: "",
    scheduled_date: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.screening_type || !formData.scheduled_date) {
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

      const { error } = await supabase.from('screenings').insert({
        patient_id: profile.id,
        screening_type: formData.screening_type,
        scheduled_date: formData.scheduled_date,
        status: 'due',
        notes: formData.notes || null
      });

      if (error) throw error;

      toast.success("Screening added successfully");
      setFormData({ screening_type: "", scheduled_date: "", notes: "" });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to add screening");
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
          <DialogTitle>Add Screening</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="screening_type">Screening Type *</Label>
            <Select value={formData.screening_type} onValueChange={(value) => setFormData(prev => ({ ...prev, screening_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select screening type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Blood glucose test">Blood Glucose Test</SelectItem>
                <SelectItem value="HIV screening">HIV Screening</SelectItem>
                <SelectItem value="Hepatitis B screening">Hepatitis B Screening</SelectItem>
                <SelectItem value="Anemia screening">Anemia Screening</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                <SelectItem value="Group B Strep">Group B Strep</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Adding..." : "Add Screening"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
