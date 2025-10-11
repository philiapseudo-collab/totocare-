import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface DuePregnancy {
  id: string;
  due_date: string;
  current_week: number;
  days_overdue: number;
}

export const DeliveryNotification = () => {
  const { t } = useAppTranslation();
  const [duePregnancies, setDuePregnancies] = useState<DuePregnancy[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile?.id) return;
    checkDuePregnancies();
  }, [profile?.id]);

  const checkDuePregnancies = async () => {
    if (!profile?.id) return;

    try {
      const { data: pregnancies, error } = await supabase
        .from('pregnancies')
        .select('id, due_date, current_week')
        .eq('mother_id', profile.id)
        .eq('status', 'pregnant');

      if (error) throw error;

      const today = new Date();
      const due = (pregnancies || [])
        .filter(p => new Date(p.due_date) <= today)
        .map(p => ({
          ...p,
          days_overdue: differenceInDays(today, new Date(p.due_date))
        }));

      setDuePregnancies(due);
    } catch (error) {
      console.error('Error checking due pregnancies:', error);
    }
  };

  const handleCreateInfant = (pregnancyId: string, dueDate: string) => {
    // Navigate to add infant page with pregnancy info
    navigate(`/add-infant?pregnancy_id=${pregnancyId}&due_date=${dueDate}`);
  };

  if (duePregnancies.length === 0) return null;

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-semibold" data-i18n="deliveryAlert.title">{t("deliveryAlert.title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {duePregnancies.map((pregnancy) => (
            <div key={pregnancy.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground" data-i18n="deliveryAlert.reachedDueDate">
                    {t("deliveryAlert.reachedDueDate")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pregnancy.days_overdue === 0 
                      ? t("deliveryAlert.dueToday")
                      : t("deliveryAlert.daysOverdue", { days: pregnancy.days_overdue, plural: pregnancy.days_overdue > 1 ? 's' : '' })}
                  </p>
                </div>
              </div>
              <Button 
                size="sm"
                onClick={() => handleCreateInfant(pregnancy.id, pregnancy.due_date)}
                data-i18n="deliveryAlert.addBabyDetails"
              >
                <Baby className="w-4 h-4 mr-2" />
                {t("deliveryAlert.addBabyDetails")}
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-2" data-i18n="deliveryAlert.instructionText">
            {t("deliveryAlert.instructionText")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
