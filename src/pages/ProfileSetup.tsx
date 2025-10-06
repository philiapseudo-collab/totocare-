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
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, Check, Baby, Calendar, User } from "lucide-react";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Health Details", icon: Calendar },
  { id: 3, title: "Pregnancy Info", icon: Baby },
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatedData, setCalculatedData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    blood_group: "",
    current_weight: "",
    role: "mother",
    pregnancy_method: "gestational", // or "lmp"
    gestational_weeks: "",
    gestational_days: "0",
    last_menstrual_period: "",
  });

  const calculatePregnancyData = async () => {
    if (formData.role !== "mother") return null;

    try {
      let requestBody: any = { userId: user?.id };

      if (formData.pregnancy_method === "gestational") {
        if (!formData.gestational_weeks) return null;
        requestBody.gestationalWeeks = parseInt(formData.gestational_weeks);
        requestBody.gestationalDays = parseInt(formData.gestational_days);
      } else {
        if (!formData.last_menstrual_period) return null;
        requestBody.lastMenstrualPeriod = formData.last_menstrual_period;
      }

      const { data, error } = await supabase.functions.invoke('calculate-due-date', {
        body: requestBody
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating pregnancy data:', error);
      return null;
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.first_name || !formData.last_name) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.date_of_birth) {
        toast({
          title: "Missing information",
          description: "Please enter your date of birth",
          variant: "destructive",
        });
        return;
      }
      // Move to step 3
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3 && formData.role === "mother") {
      // Validate pregnancy data is provided
      if (formData.pregnancy_method === "gestational" && !formData.gestational_weeks) {
        toast({
          title: "Missing information",
          description: "Please enter your gestational age",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.pregnancy_method === "lmp" && !formData.last_menstrual_period) {
        toast({
          title: "Missing information",
          description: "Please enter your last menstrual period date",
          variant: "destructive",
        });
        return;
      }

      // Calculate pregnancy data before submission
      const data = await calculatePregnancyData();
      if (!data) {
        toast({
          title: "Error",
          description: "Failed to calculate pregnancy data. Please check your inputs.",
          variant: "destructive",
        });
        return;
      }
      
      setCalculatedData(data);
      // Proceed to submit
      handleSubmit();
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get the profile id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Update profile with all info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          blood_group: formData.blood_group || null,
          current_weight: formData.current_weight ? parseFloat(formData.current_weight) : null,
          profile_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // If pregnant mother, calculate and create pregnancy record
      if (formData.role === "mother") {
        // Ensure we have calculated data
        let pregnancyData = calculatedData;
        if (!pregnancyData) {
          pregnancyData = await calculatePregnancyData();
        }
        
        if (!pregnancyData) {
          throw new Error("Failed to calculate pregnancy data. Please enter your gestational age or last menstrual period.");
        }

        const { error: pregnancyError } = await supabase
          .from("pregnancies")
          .insert({
            mother_id: profile.id,
            current_week: pregnancyData.currentWeek,
            due_date: pregnancyData.dueDate,
            status: "pregnant",
            current_trimester: pregnancyData.trimester === 1 ? 'first' : 
                             pregnancyData.trimester === 2 ? 'second' : 'third',
          });

        if (pregnancyError) throw pregnancyError;
      }

      toast({
        title: "Profile completed!",
        description: "Your profile has been set up successfully.",
      });

      navigate("/", { replace: true, state: { justCompletedProfile: true } });
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

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">Welcome to LEA</CardTitle>
              <CardDescription>
                Let's set up your profile in just a few steps
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isCompleted ? 'bg-primary text-primary-foreground' : 
                      isActive ? 'bg-primary/20 text-primary border-2 border-primary' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 text-center ${isActive ? 'font-semibold' : ''}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

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
            </div>
          )}

          {/* Step 2: Health Details */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group (Optional)</Label>
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
                <Label htmlFor="current_weight">Current Weight in kg (Optional)</Label>
                <Input
                  id="current_weight"
                  type="number"
                  step="0.1"
                  value={formData.current_weight}
                  onChange={(e) => setFormData({ ...formData, current_weight: e.target.value })}
                  placeholder="e.g., 65.5"
                />
              </div>
            </div>
          )}

          {/* Step 3: Pregnancy Info */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {formData.role === "mother" ? (
                <>
                  <div className="space-y-3">
                    <Label>How would you like to provide pregnancy information?</Label>
                    <RadioGroup
                      value={formData.pregnancy_method}
                      onValueChange={(value) => setFormData({ ...formData, pregnancy_method: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gestational" id="gestational" />
                        <Label htmlFor="gestational" className="font-normal cursor-pointer">
                          Current gestational age (weeks + days)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lmp" id="lmp" />
                        <Label htmlFor="lmp" className="font-normal cursor-pointer">
                          Last menstrual period date
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.pregnancy_method === "gestational" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gestational_weeks">Weeks *</Label>
                          <Input
                            id="gestational_weeks"
                            type="number"
                            min="0"
                            max="42"
                            value={formData.gestational_weeks}
                            onChange={(e) => setFormData({ ...formData, gestational_weeks: e.target.value })}
                            placeholder="e.g., 28"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gestational_days">Days</Label>
                          <Input
                            id="gestational_days"
                            type="number"
                            min="0"
                            max="6"
                            value={formData.gestational_days}
                            onChange={(e) => setFormData({ ...formData, gestational_days: e.target.value })}
                            placeholder="e.g., 3"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const data = await calculatePregnancyData();
                          if (data) {
                            setCalculatedData(data);
                            toast({
                              title: "Calculated!",
                              description: "Your pregnancy information has been calculated.",
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: "Please enter valid gestational age.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!formData.gestational_weeks}
                        className="w-full"
                      >
                        Calculate Due Date
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="last_menstrual_period">Last Menstrual Period *</Label>
                        <Input
                          id="last_menstrual_period"
                          type="date"
                          value={formData.last_menstrual_period}
                          onChange={(e) => setFormData({ ...formData, last_menstrual_period: e.target.value })}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const data = await calculatePregnancyData();
                          if (data) {
                            setCalculatedData(data);
                            toast({
                              title: "Calculated!",
                              description: "Your pregnancy information has been calculated.",
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: "Please enter a valid date.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!formData.last_menstrual_period}
                        className="w-full"
                      >
                        Calculate Due Date
                      </Button>
                    </>
                  )}

                  {calculatedData && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="pt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Calculated Information:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Due Date:</span>
                            <p className="font-medium">{new Date(calculatedData.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current Week:</span>
                            <p className="font-medium">{calculatedData.currentWeek}w {calculatedData.currentDay}d</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Trimester:</span>
                            <p className="font-medium capitalize">{calculatedData.trimester === 1 ? 'First' : calculatedData.trimester === 2 ? 'Second' : 'Third'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weeks Remaining:</span>
                            <p className="font-medium">{calculatedData.weeksRemaining} weeks</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Baby className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">All Set!</h3>
                  <p className="text-muted-foreground text-sm">
                    You can add infant profiles from your dashboard after completing setup.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                "Processing..."
              ) : currentStep === STEPS.length ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
