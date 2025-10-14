import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Baby, Heart, Calendar, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const { profile, pregnancy, loading: profileLoading } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showJourneyDialog, setShowJourneyDialog] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    blood_group: "",
    current_weight: "",
    gestational_weeks: "",
    due_date: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: profile.date_of_birth || "",
        blood_group: profile.blood_group || "",
        current_weight: profile.current_weight?.toString() || "",
        gestational_weeks: pregnancy?.current_week?.toString() || "",
        due_date: pregnancy?.due_date || "",
      });
    }
  }, [profile, pregnancy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          blood_group: formData.blood_group,
          current_weight: formData.current_weight ? parseFloat(formData.current_weight) : null,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Update pregnancy if exists and data is provided
      if (pregnancy && formData.gestational_weeks && formData.due_date) {
        const { error: pregnancyError } = await supabase
          .from("pregnancies")
          .update({
            current_week: parseInt(formData.gestational_weeks),
            due_date: formData.due_date,
          })
          .eq("mother_id", profile.id)
          .eq("status", "pregnant");

        if (pregnancyError) throw pregnancyError;
      }

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });

      setEditing(false);
      window.location.reload(); // Refresh to show updated data
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

  const handleJourneyChange = async (newJourney: string) => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_journey: newJourney })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Journey updated!",
        description: "Your dashboard has been switched successfully.",
      });

      setShowJourneyDialog(false);
      // Reload to show new dashboard
      setTimeout(() => navigate('/'), 500);
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

  const journeyOptions = [
    { value: 'pregnant', label: "I'm Pregnant", icon: Baby, color: 'text-pink-500' },
    { value: 'infant', label: 'I Have a Baby/Infant', icon: Heart, color: 'text-blue-500' },
    { value: 'family_planning', label: 'Family Planning & Cycle Tracking', icon: Calendar, color: 'text-purple-500' }
  ];

  const currentJourney = journeyOptions.find(j => j.value === (profile as any)?.user_journey);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <User className="h-8 w-8" />
            My Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your personal information
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Personal Information</CardTitle>
                <CardDescription>
                  Update your profile details below
                </CardDescription>
              </div>
              {!editing && (
                <Button onClick={() => setEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                    disabled={!editing}
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
                    disabled={!editing}
                    placeholder="e.g., 65.5"
                  />
                </div>

                {pregnancy && (
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
                        disabled={!editing}
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
                        disabled={!editing}
                      />
                    </div>
                  </>
                )}
              </div>

              {editing && (
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      // Reset form to current profile data
                      if (profile) {
                        setFormData({
                          first_name: profile.first_name || "",
                          last_name: profile.last_name || "",
                          date_of_birth: profile.date_of_birth || "",
                          blood_group: profile.blood_group || "",
                          current_weight: profile.current_weight?.toString() || "",
                          gestational_weeks: pregnancy?.current_week?.toString() || "",
                          due_date: pregnancy?.due_date || "",
                        });
                      }
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Journey Switcher Card */}
        {currentJourney && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                My Journey
              </CardTitle>
              <CardDescription>
                Switch between different health tracking modes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <currentJourney.icon className={`h-6 w-6 ${currentJourney.color}`} />
                  <div>
                    <p className="font-medium">{currentJourney.label}</p>
                    <p className="text-sm text-muted-foreground">Current journey</p>
                  </div>
                </div>
                <AlertDialog open={showJourneyDialog} onOpenChange={setShowJourneyDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Journey
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Change Your Journey</AlertDialogTitle>
                      <AlertDialogDescription>
                        Switching will show you different features. Your previous data will be saved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-3 py-4">
                      {journeyOptions.filter(j => j.value !== (profile as any)?.user_journey).map((journey) => (
                        <Button
                          key={journey.value}
                          variant="outline"
                          className="justify-start h-auto p-4"
                          onClick={() => handleJourneyChange(journey.value)}
                          disabled={loading}
                        >
                          <journey.icon className={`h-5 w-5 mr-3 ${journey.color}`} />
                          <span>{journey.label}</span>
                        </Button>
                      ))}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
