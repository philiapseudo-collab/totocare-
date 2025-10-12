import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface HealthScoreCardProps {
  score: number;
  grade: string;
  insights: string[];
}

export function HealthScoreCard({ score, grade, insights }: HealthScoreCardProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Health Score
          <Badge className={getGradeColor(grade)} variant="default">
            Grade {grade}
          </Badge>
        </CardTitle>
        <CardDescription>Overall health and care adherence score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
            </div>
            <Progress value={score} className="mt-4 h-3" />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Actionable Insights
          </h4>
          {insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Excellent! Keep up the great work.</span>
            </div>
          )}
        </div>

        <Button className="w-full" variant="outline">
          View Detailed Report
        </Button>
      </CardContent>
    </Card>
  );
}
