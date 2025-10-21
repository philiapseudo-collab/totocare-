import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft, Check, Baby, Calendar, User, Activity } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Dynamic steps based on journey
const getStepsForJourney = (journey: string | null) => {
  const baseSteps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Health Details", icon: Calendar },
  ];

  if (journey === "family_planning") {
    return [...baseSteps, { id: 3, title: "Cycle Tracking", icon: Activity }];
  } else if (journey === "pregnant") {
    return [...baseSteps, { id: 3, title: "Pregnancy Info", icon: Baby }];
  } else if (journey === "infant") {
    return [...baseSteps, { id: 3, title: "Infant Details", icon: Baby }];
  }

  return baseSteps;
};

export default function ProfileSetup() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatedData, setCalculatedData] = useState<any>(null);
  
  const userJourney = profile?.user_journey;
  const STEPS = getStepsForJourney(userJourney);

  // Wait for profile to load
  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Debug: Log journey type
  console.log('User Journey:', userJourney, 'Profile:', profile);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    blood_group: "",
    current_weight: "",
    // Pregnancy journey fields
    pregnancy_method: "gestational", // or "lmp"
    gestational_weeks: "",
    gestational_days: "0",
    last_menstrual_period: "",
    // Family planning journey fields
    cycle_last_period: "",
    cycle_length: "28",
    period_duration: "5",
    // Infant journey fields
    infant_name: "",
    infant_birth_date: "",
    infant_gender: "",
  });

  const calculatePregnancyData = async () => {
    if (userJourney !== "pregnant") return null;

    try {
      // Get user's current date in their timezone
      const today = new Date();
      const userDate = today.toISOString().split('T')[0];
      
      let requestBody: any = { 
        userId: user?.id,
        currentDate: userDate
      };

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

    // Step 3 validation based on journey
    if (currentStep === 3) {
      if (userJourney === "pregnant") {
        // Validate pregnancy data
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
        handleSubmit();
        return;
      } else if (userJourney === "family_planning") {
        // Validate cycle data
        if (!formData.cycle_last_period) {
          toast({
            title: "Missing information",
            description: "Please enter your last menstrual period date",
            variant: "destructive",
          });
          return;
        }
        handleSubmit();
        return;
      } else if (userJourney === "infant") {
        // Validate infant data
        if (!formData.infant_name || !formData.infant_birth_date) {
          toast({
            title: "Missing information",
            description: "Please fill in infant details",
            variant: "destructive",
          });
          return;
        }
        handleSubmit();
        return;
      }
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
    if (!user || !profile) return;

    setLoading(true);
    try {
      // Update profile with basic info
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

      // Journey-specific data handling
      if (userJourney === "pregnant") {
        // Create pregnancy record
        let pregnancyData = calculatedData;
        if (!pregnancyData) {
          pregnancyData = await calculatePregnancyData();
        }
        
        if (!pregnancyData) {
          throw new Error("Failed to calculate pregnancy data.");
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
      } else if (userJourney === "family_planning") {
        // Create cycle tracking record
        const { error: cycleError } = await supabase
          .from("reproductive_health")
          .insert({
            mother_id: profile.id,
            record_date: formData.cycle_last_period,
            menstrual_cycle_day: 1,
            cycle_length: parseInt(formData.cycle_length),
            notes: `Period duration: ${formData.period_duration} days`,
          });

        if (cycleError) throw cycleError;
      } else if (userJourney === "infant") {
        // Create infant record
        const { error: infantError } = await supabase
          .from("infants")
          .insert({
            mother_id: profile.id,
            first_name: formData.infant_name,
            birth_date: formData.infant_birth_date,
            gender: formData.infant_gender || null,
          });

        if (infantError) throw infantError;
      }

      // Invalidate profile query to refresh the cache
      await queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: "Profile completed!",
        description: "Your profile has been set up successfully.",
      });

      // Small delay to ensure state updates
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
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

          {/* Step 3: Journey-specific Info */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {userJourney === "pregnant" ? (
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
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg space-y-2">
                      <h3 className="font-semibold text-lg">Pregnancy Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Week</p>
                          <p className="font-semibold">{calculatedData.currentWeek} weeks</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trimester</p>
                          <p className="font-semibold">
                            {calculatedData.trimester === 1 ? 'First' : 
                             calculatedData.trimester === 2 ? 'Second' : 'Third'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p className="font-semibold">
                            {new Date(calculatedData.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Days Until Due</p>
                          <p className="font-semibold">{calculatedData.daysUntilDue} days</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : userJourney === "family_planning" ? (
                <>
                  <h3 className="font-semibold text-lg">Start Cycle Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Help us understand your cycle to provide personalized insights.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="cycle_last_period">Last Menstrual Period Date *</Label>
                    <Input
                      id="cycle_last_period"
                      type="date"
                      value={formData.cycle_last_period}
                      onChange={(e) => setFormData({ ...formData, cycle_last_period: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cycle_length">
                      Average Cycle Length: {formData.cycle_length} days
                    </Label>
                    <Slider
                      id="cycle_length"
                      min={21}
                      max={35}
                      step={1}
                      value={[parseInt(formData.cycle_length)]}
                      onValueChange={(value) => setFormData({ ...formData, cycle_length: value[0].toString() })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Typical range: 21-35 days
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period_duration">
                      Period Duration: {formData.period_duration} days
                    </Label>
                    <Slider
                      id="period_duration"
                      min={2}
                      max={10}
                      step={1}
                      value={[parseInt(formData.period_duration)]}
                      onValueChange={(value) => setFormData({ ...formData, period_duration: value[0].toString() })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Typical range: 2-10 days
                    </p>
                  </div>
                </>
              ) : userJourney === "infant" ? (
                <>
                  <h3 className="font-semibold text-lg">Infant Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your little one.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="infant_name">Infant's Name *</Label>
                    <Input
                      id="infant_name"
                      value={formData.infant_name}
                      onChange={(e) => setFormData({ ...formData, infant_name: e.target.value })}
                      placeholder="Enter infant's name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infant_birth_date">Birth Date *</Label>
                    <Input
                      id="infant_birth_date"
                      type="date"
                      value={formData.infant_birth_date}
                      onChange={(e) => setFormData({ ...formData, infant_birth_date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infant_gender">Gender (Optional)</Label>
                    <Select
                      value={formData.infant_gender}
                      onValueChange={(value) => setFormData({ ...formData, infant_gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : null}
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
