import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useVaccinations } from "@/hooks/useVaccinations";
import { format } from "date-fns";

export function RecentActivity() {
  const { entries } = useJournalEntries();
  const { vaccinations } = useVaccinations();

  // Combine all activities and sort by date
  const activities = [
    ...entries.map(e => ({ 
      type: 'Journal', 
      title: e.title, 
      date: new Date(e.entry_date),
      icon: '📝'
    })),
    ...vaccinations.map(v => ({ 
      type: 'Vaccination', 
      title: v.vaccine_name, 
      date: new Date(v.scheduled_date),
      icon: '💉'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-1">Activities will appear here as you use the app</p>
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