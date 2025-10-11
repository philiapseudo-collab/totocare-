import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useConditions } from "@/hooks/useConditions";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export function AIInsightsPanel() {
  const { t } = useAppTranslation();
  const { profile, pregnancy } = useProfile();
  const { conditions } = useConditions();
  const { events } = useUpcomingEvents();
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('health-insights', {
          body: {
            pregnancyWeek: pregnancy?.current_week,
            infantAgeMonths: null, // TODO: Calculate from infant data
            recentConditions: conditions.filter(c => c.is_active).map(c => c.condition_name).slice(0, 3),
            upcomingEvents: events.slice(0, 3).map(e => e.title)
          }
        });

        if (error) throw error;
        setInsights(data.insights || []);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
        setInsights(["Stay hydrated throughout the day", "Track your baby's movements daily", "Get adequate rest when possible"]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [pregnancy?.current_week, conditions, events]);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg" data-i18n="aiInsights.title">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("aiInsights.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
