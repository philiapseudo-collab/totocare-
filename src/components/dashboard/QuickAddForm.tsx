import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function QuickAddForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    entryType: "",
    date: "",
    who: "",
    clinic: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !formData.entryType || !formData.date) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      // Get the user's profile to find their patient_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      const commonData = {
        patient_id: profile.id,
        notes: formData.notes || null
      };

      // Insert based on entry type
      if (formData.entryType === "Vaccination") {
        await supabase.from('vaccinations').insert({
          ...commonData,
          vaccine_name: "New Vaccination",
          scheduled_date: formData.date,
          status: 'due',
          patient_type: formData.who || 'mother'
        });
      } else if (formData.entryType === "Appointment") {
        await supabase.from('appointments').insert({
          ...commonData,
          appointment_type: "General Checkup",
          appointment_date: new Date(formData.date).toISOString(),
          status: 'scheduled'
        });
      } else if (formData.entryType === "Screening") {
        await supabase.from('screenings').insert({
          ...commonData,
          screening_type: "General Screening",
          scheduled_date: formData.date,
          status: 'due'
        });
      }

      toast.success("Entry added successfully");
      setFormData({
        entryType: "",
        date: "",
        who: "",
        clinic: "",
        notes: ""
      });
    } catch (error: any) {
      toast.error("Failed to add entry");
      console.error('Error adding entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Add</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry-type" className="text-sm font-medium">Entry type</Label>
            <Select value={formData.entryType} onValueChange={(value) => setFormData(prev => ({...prev, entryType: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vaccination">Vaccination</SelectItem>
                <SelectItem value="Appointment">Appointment</SelectItem>
                <SelectItem value="Screening">Screening</SelectItem>
                <SelectItem value="Medication">Medication</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Date</Label>
            <Input 
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="who" className="text-sm font-medium">Who</Label>
            <Select value={formData.who} onValueChange={(value) => setFormData(prev => ({...prev, who: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Infant">Infant</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clinic" className="text-sm font-medium">Clinic</Label>
            <Input 
              id="clinic"
              value={formData.clinic}
              onChange={(e) => setFormData(prev => ({...prev, clinic: e.target.value}))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
            rows={3}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.entryType || !formData.date}
            className="w-full sm:w-auto"
          >
            {loading ? "Adding..." : "Add Entry"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}