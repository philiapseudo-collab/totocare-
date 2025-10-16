import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMedicationAdherence } from "@/hooks/useMedicationAdherence";
import { Activity, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface MedicationAdherenceCardProps {
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export function MedicationAdherenceCard({ timeRange = '30d' }: MedicationAdherenceCardProps) {
  const { stats, isLoading } = useMedicationAdherence(timeRange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medication Adherence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Medication Adherence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Adherence Rate</span>
            <span className="text-2xl font-bold text-primary">
              {stats.adherenceRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={stats.adherenceRate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.taken} taken out of {stats.total} doses
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <p className="text-2xl font-bold">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground">consecutive doses</p>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium">Total Doses</span>
            <p className="text-2xl font-bold">{stats.total}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Skipped:</span>
                <span className="font-medium">{stats.skipped}</span>
              </div>
              <div className="flex justify-between">
                <span>Missed:</span>
                <span className="font-medium">{stats.missed}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
