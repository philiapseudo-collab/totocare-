import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface VisualHealthCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  unit?: string;
  emoji?: string;
  color?: "primary" | "green" | "orange" | "red" | "blue" | "purple";
  onClick?: () => void;
  className?: string;
}

export function VisualHealthCard({
  icon: Icon,
  title,
  value,
  unit,
  emoji,
  color = "primary",
  onClick,
  className
}: VisualHealthCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
  };

  return (
    <Card 
      className={cn(
        "border-2 transition-all hover:shadow-lg",
        colorClasses[color],
        onClick && "cursor-pointer hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 text-center space-y-3">
        {/* Large Emoji/Icon */}
        <div className="flex justify-center">
          {emoji ? (
            <span className="text-5xl">{emoji}</span>
          ) : (
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-background/50"
            )}>
              <Icon className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="text-4xl font-bold">
          {value}
          {unit && <span className="text-2xl ml-1">{unit}</span>}
        </div>

        {/* Title */}
        <p className="text-sm font-medium">{title}</p>
      </CardContent>
    </Card>
  );
}
