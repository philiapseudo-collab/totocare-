import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, XCircle, Calendar } from "lucide-react";

export interface VisualStatusIndicatorProps {
  status: "completed" | "due" | "overdue" | "scheduled" | "missed" | "upcoming";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VisualStatusIndicator({ 
  status, 
  size = "md", 
  showText = true,
  className 
}: VisualStatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const iconSize = sizeClasses[size];

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
      label: "✓ Done",
      emoji: "✅"
    },
    due: {
      icon: Clock,
      color: "text-orange-600 dark:text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      label: "⏰ Due Now",
      emoji: "⏰"
    },
    overdue: {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
      label: "⚠ Overdue",
      emoji: "🚨"
    },
    scheduled: {
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      label: "📅 Scheduled",
      emoji: "📅"
    },
    missed: {
      icon: XCircle,
      color: "text-red-600 dark:text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
      label: "✗ Missed",
      emoji: "❌"
    },
    upcoming: {
      icon: Clock,
      color: "text-blue-600 dark:text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      label: "🔜 Coming",
      emoji: "🔜"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className={cn("rounded-full p-2 flex items-center justify-center", config.bg)}>
        <Icon className={cn(iconSize, config.color)} />
      </div>
      {showText && (
        <span className={cn("font-medium", config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
