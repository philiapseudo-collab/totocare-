import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCycleData } from "@/hooks/useCycleData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function CycleCalendar() {
  const navigate = useNavigate();
  const { cycles, predictions, loading } = useCycleData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Get all days in the month view (including padding days from prev/next month)
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay()); // Start from Sunday
  
  const endDate = new Date(monthEnd);
  const daysToAdd = 6 - monthEnd.getDay(); // End on Saturday
  endDate.setDate(endDate.getDate() + daysToAdd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Determine date cell styling based on cycle data
  const getDateStyles = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if it's a logged period day
    const isPeriodDay = cycles.some(cycle => {
      const start = parseISO(cycle.periodStartDate);
      const end = cycle.periodEndDate ? parseISO(cycle.periodEndDate) : null;
      if (end) {
        return date >= start && date <= end;
      }
      // If no end date, assume period duration from cycle data
      const duration = cycle.periodDuration || 5;
      const periodEnd = new Date(start);
      periodEnd.setDate(periodEnd.getDate() + duration - 1);
      return date >= start && date <= periodEnd;
    });

    if (isPeriodDay) {
      return {
        bg: 'bg-[#FF6B7A]',
        text: 'text-white',
        icon: '🔴',
        label: 'Period',
        bold: true
      };
    }

    // Check if it's a predicted period day
    const isPredictedPeriod = predictions && (() => {
      const predDate = parseISO(predictions.nextPeriodDate);
      const predEnd = new Date(predDate);
      predEnd.setDate(predEnd.getDate() + 4); // Assume 5-day period
      return date >= predDate && date <= predEnd;
    })();

    if (isPredictedPeriod) {
      return {
        bg: 'bg-[#FFD6DD] border-2 border-dashed border-[#FF6B7A]',
        text: 'text-[#C41E3A]',
        icon: '🩸',
        label: 'Expected Period',
        bold: false
      };
    }

    // Check if it's ovulation day
    const isOvulationDay = predictions && isSameDay(date, parseISO(predictions.nextOvulationDate));
    
    if (isOvulationDay) {
      return {
        bg: 'bg-gradient-to-br from-[#C77DFF] to-[#E0AAFF]',
        text: 'text-white',
        icon: '💜',
        label: 'Ovulation',
        bold: true,
        glow: true
      };
    }

    // Check if it's in fertile window
    const isInFertileWindow = predictions && (() => {
      const fertileStart = parseISO(predictions.fertileWindowStart);
      const fertileEnd = parseISO(predictions.fertileWindowEnd);
      return date >= fertileStart && date <= fertileEnd;
    })();

    if (isInFertileWindow) {
      return {
        bg: 'bg-gradient-to-br from-[#FF9ECD] to-[#FFB3D9]',
        text: 'text-[#5A189A]',
        icon: '💗',
        label: 'Fertile',
        bold: false
      };
    }

    // Lower fertility days (safe days)
    return {
      bg: 'bg-[#D4EDDA]',
      text: 'text-[#155724]',
      icon: '💚',
      label: 'Lower Fertility',
      bold: false
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 flex items-center justify-center">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">My Cycle Calendar</h1>
        </div>

        {/* Month Navigation */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const styles = getDateStyles(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  className={cn(
                    "aspect-square min-h-[44px] rounded-lg transition-all relative",
                    "flex flex-col items-center justify-center",
                    styles.bg,
                    styles.text,
                    isCurrentMonth ? "opacity-100" : "opacity-40",
                    isTodayDate && "ring-4 ring-[#9B7EBD] ring-offset-2",
                    styles.glow && "shadow-lg shadow-purple-500/50",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  <span className={cn(
                    "text-sm md:text-base",
                    styles.bold && "font-bold"
                  )}>
                    {format(date, 'd')}
                  </span>
                  <span className="text-xs mt-0.5">
                    {styles.icon}
                  </span>
                  {isTodayDate && (
                    <span className="absolute -bottom-1 text-[8px] font-semibold bg-[#9B7EBD] text-white px-1 rounded">
                      TODAY
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Legend Section */}
        <Card className="p-6 mt-6">
          <h3 className="font-semibold text-lg mb-4">Calendar Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B7A] flex items-center justify-center text-white font-bold">
                🔴
              </div>
              <div>
                <div className="font-medium">Period Day</div>
                <div className="text-xs text-muted-foreground">Logged/actual</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFD6DD] border-2 border-dashed border-[#FF6B7A] flex items-center justify-center">
                🩸
              </div>
              <div>
                <div className="font-medium">Expected Period</div>
                <div className="text-xs text-muted-foreground">Predicted</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C77DFF] to-[#E0AAFF] flex items-center justify-center text-white font-bold">
                💜
              </div>
              <div>
                <div className="font-medium">Ovulation Day</div>
                <div className="text-xs text-muted-foreground">Peak fertility</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF9ECD] to-[#FFB3D9] flex items-center justify-center">
                💗
              </div>
              <div>
                <div className="font-medium">Fertile Window</div>
                <div className="text-xs text-muted-foreground">High pregnancy chance</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4EDDA] flex items-center justify-center">
                💚
              </div>
              <div>
                <div className="font-medium">Lower Fertility</div>
                <div className="text-xs text-muted-foreground">Relatively safer days</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border-4 border-[#9B7EBD] flex items-center justify-center font-bold">
                ⭐
              </div>
              <div>
                <div className="font-medium">Today</div>
                <div className="text-xs text-muted-foreground">Current date</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> This calendar is for tracking purposes only. No day is 100% safe for pregnancy prevention. Always use appropriate contraception.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
