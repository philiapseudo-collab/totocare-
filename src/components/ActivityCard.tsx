import React, { useMemo } from "react";
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

export const ActivityCard = React.memo(({ item, onAction, className }: ActivityCardProps) => {
  const typeIcons = useMemo(() => ({
    vaccination: "💉",
    appointment: "📅",
    screening: "🔬",
    medication: "💊",
    general: "📋"
  }), []);

  const typeLabels = useMemo(() => ({
    vaccination: "Vaccination",
    appointment: "Appointment",
    screening: "Screening",
    medication: "Medication",
    general: "General"
  }), []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onAction && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onAction(item);
    }
  };

  const ariaLabel = `${typeLabels[item.type]}: ${item.title}, ${item.status}, ${item.time}`;

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow",
        onAction && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      tabIndex={onAction ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onClick={onAction ? () => onAction(item) : undefined}
      role={onAction ? "button" : "article"}
      aria-label={onAction ? `View ${ariaLabel}` : ariaLabel}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span 
                className="text-lg" 
                aria-hidden="true"
                title={typeLabels[item.type]}
              >
                {typeIcons[item.type]}
              </span>
              <h3 className="font-medium text-foreground">{item.title}</h3>
              <StatusBadge status={item.status}>{item.status}</StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            <p className="text-xs text-muted-foreground">
              <time dateTime={item.time}>{item.time}</time>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});