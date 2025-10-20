import { Skeleton } from "./ui/skeleton";

interface LoadingSkeletonProps {
  type?: 'list' | 'card' | 'table' | 'detail';
  count?: number;
}

export function LoadingSkeleton({ type = 'list', count = 3 }: LoadingSkeletonProps) {
  if (type === 'list') {
    return (
      <div className="space-y-3 animate-fade-in">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-2 animate-fade-in">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return null;
}
