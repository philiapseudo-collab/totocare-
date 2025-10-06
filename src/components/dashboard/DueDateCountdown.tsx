import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, Baby, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Pregnancy {
  id: string;
  due_date: string;
  current_week: number;
  current_trimester: string;
  status: string;
}

export function DueDateCountdown() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pregnancy, setPregnancy] = useState<Pregnancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [weeksPassed, setWeeksPassed] = useState(0);
  const [weeksRemaining, setWeeksRemaining] = useState(0);
  const [daysRemainingInWeek, setDaysRemainingInWeek] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editWeeks, setEditWeeks] = useState("");
  const [editDays, setEditDays] = useState("0");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPregnancyData = async () => {
      if (!user) return;

      try {
        // First get the user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        // Then get the active pregnancy
        const { data: pregnancyData, error } = await supabase
          .from('pregnancies')
          .select('*')
          .eq('mother_id', profile.id)
          .eq('status', 'pregnant')
          .single();

        if (error) {
          console.log('No active pregnancy found');
          return;
        }

        setPregnancy(pregnancyData);

        // Calculate days remaining until due date (real-time calculation)
        const dueDate = new Date(pregnancyData.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        setDaysRemaining(Math.max(0, daysDiff));

        // Calculate weeks remaining (40 weeks - current week)
        const totalWeeks = 40;
        const currentWeek = pregnancyData.current_week || 0;
        
        // Calculate total days remaining until 40 weeks
        const totalDaysRemaining = (totalWeeks * 7) - (currentWeek * 7);
        const weeksRem = Math.floor(totalDaysRemaining / 7);
        const daysRem = totalDaysRemaining % 7;
        
        setWeeksPassed(currentWeek);
        setWeeksRemaining(weeksRem);
        setDaysRemainingInWeek(daysRem);
        setProgressPercentage((currentWeek / totalWeeks) * 100);

      } catch (error) {
        console.error('Error fetching pregnancy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPregnancyData();
  }, [user]);

  const handleUpdateGestationalAge = async () => {
    if (!pregnancy || !editWeeks) {
      toast({
        title: "Missing information",
        description: "Please enter the gestational weeks",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const weeks = parseInt(editWeeks);
      const days = parseInt(editDays);

      // Calculate new due date based on gestational age
      const { data, error } = await supabase.functions.invoke('calculate-due-date', {
        body: {
          gestationalWeeks: weeks,
          gestationalDays: days,
          userId: user?.id
        }
      });

      if (error) throw error;

      // Update pregnancy record
      const { error: updateError } = await supabase
        .from('pregnancies')
        .update({
          current_week: data.currentWeek,
          due_date: data.dueDate,
          current_trimester: data.trimester === 1 ? 'first' : 
                           data.trimester === 2 ? 'second' : 'third',
        })
        .eq('id', pregnancy.id);

      if (updateError) throw updateError;

      toast({
        title: "Updated successfully",
        description: "Gestational age and due date have been updated",
      });

      setEditDialogOpen(false);
      
      // Refresh data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update gestational age",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Baby className="h-5 w-5 text-primary" />
            Due Date Countdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pregnancy) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Baby className="h-5 w-5 text-primary" />
            Due Date Countdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No active pregnancy found
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDaysRemaining = (days: number) => {
    if (days === 0) return "Due today!";
    if (days < 0) return "Overdue";
    
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    if (weeks === 0) return `${days} day${days === 1 ? '' : 's'}`;
    if (remainingDays === 0) return `${weeks} week${weeks === 1 ? '' : 's'}`;
    return `${weeks}w ${remainingDays}d`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Baby className="h-5 w-5 text-primary" />
            Due Date Countdown
          </CardTitle>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setEditWeeks(weeksPassed.toString());
                  setEditDays("0");
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Gestational Age</DialogTitle>
                <DialogDescription>
                  Enter your current gestational age to update the due date calculation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-weeks">Weeks</Label>
                    <Input
                      id="edit-weeks"
                      type="number"
                      min="0"
                      max="42"
                      value={editWeeks}
                      onChange={(e) => setEditWeeks(e.target.value)}
                      placeholder="e.g., 28"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-days">Days</Label>
                    <Input
                      id="edit-days"
                      type="number"
                      min="0"
                      max="6"
                      value={editDays}
                      onChange={(e) => setEditDays(e.target.value)}
                      placeholder="e.g., 3"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateGestationalAge}
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {weeksRemaining}w {daysRemainingInWeek}d
          </div>
          <p className="text-sm text-muted-foreground">until your due date</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Week {weeksPassed} of 40</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Due: {new Date(pregnancy.due_date).toLocaleDateString()}</span>
          </div>
          <div className="capitalize">
            {pregnancy.current_trimester} trimester
          </div>
        </div>
      </CardContent>
    </Card>
  );
}