import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  status: "due" | "overdue" | "completed" | "scheduled" | "missed" | "upcoming";
  type: "vaccination" | "appointment" | "screening" | "medication" | "general";
}

export interface ActivityCardProps {
  item: ActivityItem;
  onAction?: (item: ActivityItem) => void;
  className?: string;
}

export function ActivityCard({ item, onAction, className }: ActivityCardProps) {
  const typeIcons = {
    vaccination: "💉",
    appointment: "📅",
    screening: "🔬",
    medication: "💊",
    general: "📋"
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{typeIcons[item.type]}</span>
              <h3 className="font-medium text-foreground">{item.title}</h3>
              <StatusBadge status={item.status}>{item.status}</StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            <p className="text-xs text-muted-foreground">{item.time}</p>
          </div>
          {onAction && (
            <button
              onClick={() => onAction(item)}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}