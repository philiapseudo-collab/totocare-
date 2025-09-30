import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: "due" | "overdue" | "completed" | "scheduled" | "missed" | "upcoming";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusStyles = {
    due: "bg-status-due text-status-due-foreground",
    overdue: "bg-status-overdue text-status-overdue-foreground",
    completed: "bg-status-completed text-status-completed-foreground",
    scheduled: "bg-status-scheduled text-status-scheduled-foreground",
    missed: "bg-status-overdue text-status-overdue-foreground",
    upcoming: "bg-status-due text-status-due-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}