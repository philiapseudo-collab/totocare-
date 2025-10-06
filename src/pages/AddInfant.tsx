import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Baby, ArrowLeft } from "lucide-react";
import { z } from "zod";

const infantSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  birth_date: z.string().min(1, "Birth date is required"),
  birth_weight: z.string().optional(),
  birth_height: z.string().optional(),
  gender: z.string().optional(),
  current_weight: z.string().optional(),
  current_height: z.string().optional(),
});

export default function AddInfant() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const pregnancyId = searchParams.get('pregnancy_id');
  const dueDate = searchParams.get('due_date');
  
  const [formData, setFormData] = useState({
    first_name: "",
    birth_date: dueDate || "",
    birth_weight: "",
    birth_height: "",
    gender: "",
    current_weight: "",
    current_height: "",
  });

  useEffect(() => {
    if (dueDate && !formData.birth_date) {
      setFormData(prev => ({ ...prev, birth_date: dueDate }));
    }
  }, [dueDate]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to add an infant",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = infantSchema.parse(formData);

      // Prepare data for insertion
      const infantData = {
        mother_id: profile.id,
        pregnancy_id: pregnancyId || null,
        first_name: validatedData.first_name,
        birth_date: validatedData.birth_date,
        birth_weight: validatedData.birth_weight ? parseFloat(validatedData.birth_weight) : null,
        birth_height: validatedData.birth_height ? parseFloat(validatedData.birth_height) : null,
        gender: validatedData.gender || null,
        current_weight: validatedData.current_weight ? parseFloat(validatedData.current_weight) : null,
        current_height: validatedData.current_height ? parseFloat(validatedData.current_height) : null,
      };

      // Insert into database
      const { error } = await supabase
        .from("infants")
        .insert(infantData);

      if (error) throw error;

      // Update pregnancy status if linked
      if (pregnancyId) {
        await supabase
          .from("pregnancies")
          .update({ status: 'postpartum' })
          .eq('id', pregnancyId);
      }

      toast({
        title: "Success!",
        description: "Infant profile has been created successfully.",
      });

      navigate("/vaccinations", { replace: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add infant profile",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Baby className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Infant Profile</CardTitle>
                <CardDescription>
                  Create a profile to track your infant's health and development
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    Infant's First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Enter infant's first name"
                    maxLength={100}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">
                    Birth Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.birth_date && (
                    <p className="text-sm text-destructive">{errors.birth_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender (Optional)</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Birth Measurements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Birth Measurements</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_weight">Birth Weight (kg)</Label>
                    <Input
                      id="birth_weight"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.birth_weight}
                      onChange={(e) => setFormData({ ...formData, birth_weight: e.target.value })}
                      placeholder="e.g., 3.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_height">Birth Height (cm)</Label>
                    <Input
                      id="birth_height"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.birth_height}
                      onChange={(e) => setFormData({ ...formData, birth_height: e.target.value })}
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>
              </div>

              {/* Current Measurements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Measurements (Optional)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_weight">Current Weight (kg)</Label>
                    <Input
                      id="current_weight"
                      type="number"
                      step="0.01"
                      min="0"
                      max="50"
                      value={formData.current_weight}
                      onChange={(e) => setFormData({ ...formData, current_weight: e.target.value })}
                      placeholder="e.g., 4.2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current_height">Current Height (cm)</Label>
                    <Input
                      id="current_height"
                      type="number"
                      step="0.1"
                      min="0"
                      max="150"
                      value={formData.current_height}
                      onChange={(e) => setFormData({ ...formData, current_height: e.target.value })}
                      placeholder="e.g., 55"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Saving..." : "Save Infant Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
