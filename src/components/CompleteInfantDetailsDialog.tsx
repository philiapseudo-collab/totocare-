import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CompleteInfantDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  infant: {
    id: string;
    first_name: string;
    birth_date: string;
    gender: string | null;
  };
  onComplete?: () => void;
}

export const CompleteInfantDetailsDialog = ({
  open,
  onOpenChange,
  infant,
  onComplete
}: CompleteInfantDetailsDialogProps) => {
  const [firstName, setFirstName] = useState(infant.first_name);
  const [gender, setGender] = useState<string>(infant.gender || '');
  const [birthDate, setBirthDate] = useState(infant.birth_date);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      toast.error('Please enter a name for your baby');
      return;
    }

    if (!gender) {
      toast.error('Please select a gender');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('infants')
        .update({
          first_name: firstName.trim(),
          gender: gender,
          birth_date: birthDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', infant.id);

      if (error) throw error;

      toast.success(`${firstName}'s profile has been completed!`);
      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      console.error('Error updating infant details:', error);
      toast.error('Failed to update baby details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullProfile = () => {
    onOpenChange(false);
    navigate('/add-infant');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Baby Profile</DialogTitle>
          <DialogDescription>
            A new baby profile was created based on your pregnancy. Please complete the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Birth Date Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Birth Date</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{format(new Date(birthDate), 'MMMM dd, yyyy')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This was automatically set based on your due date. You can adjust it in the full profile.
            </p>
          </div>

          {/* Baby Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              Baby's Name *
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter baby's name"
              required
              className="w-full"
            />
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Gender *</Label>
            <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal cursor-pointer">Boy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal cursor-pointer">Girl</Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleViewFullProfile}
              disabled={loading}
            >
              Complete Later
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Details'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
