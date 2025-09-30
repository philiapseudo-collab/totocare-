import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, Baby } from "lucide-react";

interface Pregnancy {
  id: string;
  due_date: string;
  current_week: number;
  current_trimester: string;
  status: string;
}

export function DueDateCountdown() {
  const { user } = useAuth();
  const [pregnancy, setPregnancy] = useState<Pregnancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [weeksPassed, setWeeksPassed] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

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

        // Calculate days remaining
        const dueDate = new Date(pregnancyData.due_date);
        const today = new Date();
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        setDaysRemaining(Math.max(0, daysDiff));

        // Calculate weeks passed (40 weeks total pregnancy)
        const totalWeeks = 40;
        const currentWeek = pregnancyData.current_week || 0;
        setWeeksPassed(currentWeek);
        setProgressPercentage((currentWeek / totalWeeks) * 100);

      } catch (error) {
        console.error('Error fetching pregnancy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPregnancyData();
  }, [user]);

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
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Baby className="h-5 w-5 text-primary" />
          Due Date Countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {formatDaysRemaining(daysRemaining)}
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