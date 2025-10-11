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
import { useAppTranslation } from "@/hooks/useAppTranslation";

export function QuickAddForm() {
  const { t } = useAppTranslation();
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
        <CardTitle className="text-lg font-semibold" data-i18n="quickAdd.title">{t("quickAdd.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry-type" className="text-sm font-medium" data-i18n="quickAdd.entryType">{t("quickAdd.entryType")}</Label>
            <Select value={formData.entryType} onValueChange={(value) => setFormData(prev => ({...prev, entryType: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vaccination" data-i18n="quickAdd.vaccination">{t("quickAdd.vaccination")}</SelectItem>
                <SelectItem value="Appointment" data-i18n="quickAdd.appointment">{t("quickAdd.appointment")}</SelectItem>
                <SelectItem value="Medication" data-i18n="quickAdd.medication">{t("quickAdd.medication")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium" data-i18n="quickAdd.date">{t("quickAdd.date")}</Label>
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
            <Label htmlFor="who" className="text-sm font-medium" data-i18n="quickAdd.who">{t("quickAdd.who")}</Label>
            <Select value={formData.who} onValueChange={(value) => setFormData(prev => ({...prev, who: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Infant" data-i18n="quickAdd.infant">{t("quickAdd.infant")}</SelectItem>
                <SelectItem value="Mother" data-i18n="quickAdd.mother">{t("quickAdd.mother")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clinic" className="text-sm font-medium" data-i18n="quickAdd.clinic">{t("quickAdd.clinic")}</Label>
            <Input 
              id="clinic"
              value={formData.clinic}
              onChange={(e) => setFormData(prev => ({...prev, clinic: e.target.value}))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium" data-i18n="quickAdd.notes">{t("quickAdd.notes")}</Label>
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
            data-i18n="quickAdd.addEntry"
          >
            {loading ? t("quickAdd.adding") : t("quickAdd.addEntry")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}