import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: "due" | "overdue" | "completed" | "scheduled" | "missed" | "upcoming";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusConfig = {
    due: { 
      style: "bg-status-due text-status-due-foreground",
      emoji: "⏰"
    },
    overdue: { 
      style: "bg-status-overdue text-status-overdue-foreground",
      emoji: "🚨"
    },
    completed: { 
      style: "bg-status-completed text-status-completed-foreground",
      emoji: "✅"
    },
    scheduled: { 
      style: "bg-status-scheduled text-status-scheduled-foreground",
      emoji: "📅"
    },
    missed: { 
      style: "bg-status-overdue text-status-overdue-foreground",
      emoji: "❌"
    },
    upcoming: { 
      style: "bg-status-due text-status-due-foreground",
      emoji: "🔜"
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.style,
        className
      )}
    >
      <span>{config.emoji}</span>
      {children}
    </span>
  );
}