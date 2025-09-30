import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date_of_birth: "",
    blood_group: "",
    current_weight: "",
    role: "mother",
    gestational_weeks: "",
    due_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // First, get the profile id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Update profile with basic info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          date_of_birth: formData.date_of_birth,
          blood_group: formData.blood_group,
          current_weight: formData.current_weight ? parseFloat(formData.current_weight) : null,
          profile_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // If pregnant mother, create pregnancy record
      if (formData.role === "mother" && formData.gestational_weeks && formData.due_date) {
        const { error: pregnancyError } = await supabase
          .from("pregnancies")
          .insert({
            mother_id: profile.id,
            current_week: parseInt(formData.gestational_weeks),
            due_date: formData.due_date,
            status: "pregnant",
          });

        if (pregnancyError) throw pregnancyError;
      }

      toast({
        title: "Profile completed!",
        description: "Your profile has been set up successfully.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us personalize your experience by providing some basic information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Pregnant Mother</SelectItem>
                  <SelectItem value="infant">Parent of Infant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group</Label>
              <Select
                value={formData.blood_group}
                onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_weight">Current Weight (kg)</Label>
              <Input
                id="current_weight"
                type="number"
                step="0.1"
                value={formData.current_weight}
                onChange={(e) => setFormData({ ...formData, current_weight: e.target.value })}
                placeholder="e.g., 65.5"
              />
            </div>

            {formData.role === "mother" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="gestational_weeks">Current Gestational Week</Label>
                  <Input
                    id="gestational_weeks"
                    type="number"
                    min="1"
                    max="42"
                    value={formData.gestational_weeks}
                    onChange={(e) => setFormData({ ...formData, gestational_weeks: e.target.value })}
                    placeholder="e.g., 28"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Expected Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
