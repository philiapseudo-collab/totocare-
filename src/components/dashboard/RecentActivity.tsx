import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "success" | "warning" | "info";
  icon: React.ReactNode;
}

export function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: "iron-supplement",
      title: "Iron supplement logged",
      description: "Mother • 60mg ferrous sulfate",
      timestamp: "Today, 9:00 AM",
      type: "success",
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      id: "vaccine-rotavirus",
      title: "Vaccine: Rotavirus",
      description: "Infant • Dose 1 completed",
      timestamp: "Yesterday",
      type: "success",
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      id: "blood-pressure-elevated",
      title: "Blood pressure elevated",
      description: "Mother • 142/92 mmHg",
      timestamp: "2 days ago",
      type: "warning",
      icon: <AlertTriangle className="w-4 h-4 text-orange-500" />
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 py-2">
            {activity.icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground">{activity.title}</h4>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.timestamp}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}