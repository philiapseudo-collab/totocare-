import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useVaccinations } from "@/hooks/useVaccinations";
import { format } from "date-fns";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useMemo } from "react";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export function RecentActivity() {
  const { t } = useAppTranslation();
  const { entries, loading: entriesLoading } = useJournalEntries();
  const { vaccinations, loading: vaccinationsLoading } = useVaccinations();

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

  const isLoading = entriesLoading || vaccinationsLoading;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold" data-i18n="recentActivity.title">{t("recentActivity.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton type="list" count={3} />
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title={t("recentActivity.noActivity")}
            description={t("recentActivity.activitiesWillAppear")}
            iconClassName="text-primary"
          />
        ) : (
          <div className="space-y-3">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover-scale">
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