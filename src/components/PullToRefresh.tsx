import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh?: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({ onRefresh });

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 flex items-center justify-center transition-all duration-200",
          "bg-background/80 backdrop-blur-sm"
        )}
        style={{
          height: isPulling || isRefreshing ? "60px" : "0px",
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2
            className={cn(
              "h-5 w-5",
              isRefreshing ? "animate-spin text-primary" : ""
            )}
            style={{
              transform: isRefreshing ? "rotate(0deg)" : `rotate(${pullDistance * 4}deg)`,
            }}
          />
          <span>{isRefreshing ? "Refreshing..." : "Pull to refresh"}</span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: isPulling || isRefreshing ? `translateY(${Math.min(pullDistance, 60)}px)` : "translateY(0)",
          transition: isPulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
};
