import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Baby, Calendar, Target, TrendingUp } from "lucide-react";

interface PregnancyProgressTrackerProps {
  currentWeek: number;
  currentDay?: number;
  dueDate: string;
  trimester: string;
  daysUntilDue?: number;
  nextMilestones: string[];
  expectedWeightGain?: { min: number; max: number; current: number };
}

export function PregnancyProgressTracker({
  currentWeek,
  currentDay = 0,
  dueDate,
  trimester,
  daysUntilDue = 0,
  nextMilestones,
  expectedWeightGain
}: PregnancyProgressTrackerProps) {
  const progressPercentage = Math.round((currentWeek / 40) * 100);
  
  const getTrimesterColor = (trimester: string) => {
    switch (trimester) {
      case 'first': return 'bg-blue-500';
      case 'second': return 'bg-purple-500';
      case 'third': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Pregnancy Progress
          </span>
          <Badge className={getTrimesterColor(trimester)}>
            {trimester.charAt(0).toUpperCase() + trimester.slice(1)} Trimester
          </Badge>
        </CardTitle>
        <CardDescription>Track your pregnancy journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Current Week</div>
            <div className="text-3xl font-bold text-primary">
              {currentWeek}
              <span className="text-sm font-normal">.{currentDay}</span>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Due Date</div>
            <div className="text-lg font-semibold">
              {new Date(dueDate).toLocaleDateString()}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Days Until Due</div>
            <div className="text-3xl font-bold">{daysUntilDue}</div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Progress</div>
            <div className="text-3xl font-bold">{progressPercentage}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pregnancy Progress</span>
            <span className="font-medium">{currentWeek} / 40 weeks</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {expectedWeightGain && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Expected Weight Gain Range
            </h4>
            <div className="text-sm text-muted-foreground">
              {expectedWeightGain.min.toFixed(1)} - {expectedWeightGain.max.toFixed(1)} lbs
              <Badge variant="outline" className="ml-2">
                Current: Week {expectedWeightGain.current}
              </Badge>
            </div>
          </div>
        )}

        {nextMilestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Upcoming Milestones
            </h4>
            <ul className="space-y-2">
              {nextMilestones.map((milestone, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted rounded">
                  <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  {milestone}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
