import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMedicationAdherence } from "@/hooks/useMedicationAdherence";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfDay, subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface MedicationAdherenceChartProps {
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export function MedicationAdherenceChart({ timeRange = '30d' }: MedicationAdherenceChartProps) {
  const { actions, isLoading } = useMedicationAdherence(timeRange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Adherence Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Group actions by day
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const chartData = Array.from({ length: days }, (_, i) => {
    const date = startOfDay(subDays(new Date(), days - 1 - i));
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayActions = actions.filter(action => {
      const actionDate = format(startOfDay(parseISO(action.action_time)), 'yyyy-MM-dd');
      return actionDate === dateStr;
    });

    return {
      date: format(date, 'MMM dd'),
      taken: dayActions.filter(a => a.action_type === 'taken').length,
      skipped: dayActions.filter(a => a.action_type === 'skipped').length,
      missed: dayActions.filter(a => a.action_type === 'missed').length,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Adherence Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={Math.floor(days / 7)}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="taken" fill="hsl(var(--success))" name="Taken" />
            <Bar dataKey="skipped" fill="hsl(var(--warning))" name="Skipped" />
            <Bar dataKey="missed" fill="hsl(var(--error))" name="Missed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
