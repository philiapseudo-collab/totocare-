import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UsePullToRefreshOptions {
  onRefresh?: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions = {}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at top of page
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        isTouching = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      if (distance > 0 && window.scrollY === 0) {
        // Prevent default scroll behavior
        e.preventDefault();
        setPullDistance(Math.min(distance / resistance, threshold));
      }
    };

    const handleTouchEnd = async () => {
      if (!isTouching) return;
      isTouching = false;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);

        try {
          if (onRefresh) {
            await onRefresh();
          } else {
            // Default: invalidate all queries
            await queryClient.invalidateQueries();
          }
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 300);
        }
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, threshold, resistance, onRefresh, queryClient]);

  return {
    isRefreshing,
    pullDistance,
    isPulling: pullDistance > 0,
  };
};
