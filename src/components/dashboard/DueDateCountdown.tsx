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
import { useAppTranslation } from "@/hooks/useAppTranslation";

interface Pregnancy {
  id: string;
  due_date: string;
  current_week: number;
  current_trimester: string;
  status: string;
}

export function DueDateCountdown() {
  const { t } = useAppTranslation();
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

        // Calculate days remaining until due date using user's local timezone
        const dueDate = new Date(pregnancyData.due_date + 'T00:00:00');
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

      // Get user's current date in their timezone
      const today = new Date();
      const userDate = today.toISOString().split('T')[0];

      // Calculate new due date based on gestational age
      const { data, error } = await supabase.functions.invoke('calculate-due-date', {
        body: {
          gestationalWeeks: weeks,
          gestationalDays: days,
          userId: user?.id,
          currentDate: userDate
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
          <CardTitle className="text-lg font-semibold flex items-center gap-2" data-i18n="babyDevelopment.dueDateCountdown">
            <Baby className="h-5 w-5 text-primary" />
            {t("babyDevelopment.dueDateCountdown")}
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
          <CardTitle className="text-lg font-semibold flex items-center gap-2" data-i18n="babyDevelopment.dueDateCountdown">
            <Baby className="h-5 w-5 text-primary" />
            {t("babyDevelopment.dueDateCountdown")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4" data-i18n="babyDevelopment.noActivePregnancy">
            {t("babyDevelopment.noActivePregnancy")}
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
          <CardTitle className="text-lg font-semibold flex items-center gap-2" data-i18n="babyDevelopment.title">
            <span className="text-2xl">🤰</span>
            {t("babyDevelopment.title")}
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
                <DialogTitle data-i18n="babyDevelopment.updateGestationalAge">{t("babyDevelopment.updateGestationalAge")}</DialogTitle>
                <DialogDescription data-i18n="babyDevelopment.updateDescription">
                  {t("babyDevelopment.updateDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-weeks" data-i18n="babyDevelopment.weeks">{t("babyDevelopment.weeks")}</Label>
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
                    <Label htmlFor="edit-days" data-i18n="babyDevelopment.days">{t("babyDevelopment.days")}</Label>
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
                    data-i18n="babyDevelopment.cancel"
                  >
                    {t("babyDevelopment.cancel")}
                  </Button>
                  <Button
                    onClick={handleUpdateGestationalAge}
                    disabled={updating}
                    data-i18n="babyDevelopment.update"
                  >
                    {updating ? t("babyDevelopment.updating") : t("babyDevelopment.update")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center bg-primary/10 rounded-xl p-6">
          <div className="text-5xl mb-3">📅</div>
          <div className="text-4xl font-bold text-primary mb-2">
            {weeksRemaining}w {daysRemainingInWeek}d
          </div>
          <p className="text-base font-medium" data-i18n="babyDevelopment.untilBabyArrives">{t("babyDevelopment.untilBabyArrives")}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-base font-medium">
            <span className="flex items-center gap-2">
              <span>🗓</span>
              <span data-i18n="babyDevelopment.weekOf40">{t("babyDevelopment.weekOf40", { week: weeksPassed })}</span>
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="flex flex-col gap-2 text-sm pt-2 bg-secondary/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="font-medium" data-i18n="babyDevelopment.dueDate">{t("babyDevelopment.dueDate")}</span>
            <span>{new Date(pregnancy.due_date + 'T00:00:00').toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🤰</span>
            <span className="font-medium" data-i18n="babyDevelopment.stage">{t("babyDevelopment.stage")}</span>
            <span className="capitalize">{pregnancy.current_trimester} {t("babyDevelopment.trimester")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}