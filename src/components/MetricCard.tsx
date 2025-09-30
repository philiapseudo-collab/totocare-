import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className
}: MetricCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    stable: "text-muted-foreground"
  };

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline space-x-2 mt-2">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {trend && trendValue && (
                <span className={cn("text-sm font-medium", trendColors[trend])}>
                  {trendValue}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="ml-4 p-3 bg-accent rounded-lg">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}