import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useVaccinations } from "@/hooks/useVaccinations";
import { format } from "date-fns";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useMemo } from "react";

export function RecentActivity() {
  const { t } = useAppTranslation();
  const { entries } = useJournalEntries();
  const { vaccinations } = useVaccinations();

  // Combine all activities and sort by date - memoized for performance
  const activities = useMemo(() => {
    return [
      ...entries.map(e => ({ 
        type: t("recentActivity.journal"), 
        title: e.title, 
        date: new Date(e.entry_date),
        icon: '📝'
      })),
      ...vaccinations.map(v => ({ 
        type: t("recentActivity.vaccination"), 
        title: v.vaccine_name, 
        date: new Date(v.scheduled_date),
        icon: '💉'
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [entries, vaccinations, t]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold" data-i18n="recentActivity.title">{t("recentActivity.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground" data-i18n="recentActivity.noActivity">{t("recentActivity.noActivity")}</p>
            <p className="text-sm text-muted-foreground mt-1" data-i18n="recentActivity.activitiesWillAppear">{t("recentActivity.activitiesWillAppear")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.type} • {format(activity.date, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}