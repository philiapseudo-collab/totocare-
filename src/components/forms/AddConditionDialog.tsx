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

interface AddConditionDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddConditionDialog({ trigger, onSuccess }: AddConditionDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    condition_name: "",
    diagnosed_date: "",
    severity: "moderate",
    treatment: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.condition_name) {
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

      const { error } = await supabase.from('conditions').insert({
        patient_id: profile.id,
        condition_name: formData.condition_name,
        diagnosed_date: formData.diagnosed_date || null,
        severity: formData.severity as 'mild' | 'moderate' | 'severe',
        is_active: true,
        treatment: formData.treatment || null,
        notes: formData.notes || null
      });

      if (error) throw error;

      toast.success("Condition added successfully");
      setFormData({
        condition_name: "",
        diagnosed_date: "",
        severity: "moderate",
        treatment: "",
        notes: ""
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to add condition");
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
          <DialogTitle>Add Medical Condition</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition_name">Condition Name *</Label>
            <Input
              id="condition_name"
              value={formData.condition_name}
              onChange={(e) => setFormData(prev => ({ ...prev, condition_name: e.target.value }))}
              placeholder="e.g., Gestational Diabetes"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosed_date">Diagnosed Date</Label>
              <Input
                id="diagnosed_date"
                type="date"
                value={formData.diagnosed_date}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosed_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment</Label>
            <Input
              id="treatment"
              value={formData.treatment}
              onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
              placeholder="e.g., Insulin therapy, diet modification"
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
              {loading ? "Adding..." : "Add Condition"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
