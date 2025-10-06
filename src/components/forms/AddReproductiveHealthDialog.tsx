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

interface AddReproductiveHealthDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddReproductiveHealthDialog({ trigger, onSuccess }: AddReproductiveHealthDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    record_date: new Date().toISOString().split('T')[0],
    menstrual_cycle_day: "",
    cycle_length: "",
    flow_intensity: "",
    temperature: "",
    mood: "",
    symptoms: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.record_date) {
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

      const { error } = await supabase.from('reproductive_health').insert({
        mother_id: profile.id,
        record_date: formData.record_date,
        menstrual_cycle_day: formData.menstrual_cycle_day ? parseInt(formData.menstrual_cycle_day) : null,
        cycle_length: formData.cycle_length ? parseInt(formData.cycle_length) : null,
        flow_intensity: formData.flow_intensity || null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        mood: formData.mood || null,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : null,
        notes: formData.notes || null
      });

      if (error) throw error;

      toast.success("Record added successfully");
      setFormData({
        record_date: new Date().toISOString().split('T')[0],
        menstrual_cycle_day: "",
        cycle_length: "",
        flow_intensity: "",
        temperature: "",
        mood: "",
        symptoms: "",
        notes: ""
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to add record");
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
          <DialogTitle>Add Reproductive Health Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="record_date">Date *</Label>
            <Input
              id="record_date"
              type="date"
              value={formData.record_date}
              onChange={(e) => setFormData(prev => ({ ...prev, record_date: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="menstrual_cycle_day">Cycle Day</Label>
              <Input
                id="menstrual_cycle_day"
                type="number"
                min="1"
                max="40"
                value={formData.menstrual_cycle_day}
                onChange={(e) => setFormData(prev => ({ ...prev, menstrual_cycle_day: e.target.value }))}
                placeholder="e.g., 14"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycle_length">Cycle Length</Label>
              <Input
                id="cycle_length"
                type="number"
                min="20"
                max="40"
                value={formData.cycle_length}
                onChange={(e) => setFormData(prev => ({ ...prev, cycle_length: e.target.value }))}
                placeholder="e.g., 28"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flow_intensity">Flow Intensity</Label>
              <Select value={formData.flow_intensity} onValueChange={(value) => setFormData(prev => ({ ...prev, flow_intensity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                placeholder="e.g., 36.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">Mood</Label>
            <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="anxious">Anxious</SelectItem>
                <SelectItem value="irritable">Irritable</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms (comma separated)</Label>
            <Input
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              placeholder="e.g., cramps, headache, bloating"
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
              {loading ? "Adding..." : "Add Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
