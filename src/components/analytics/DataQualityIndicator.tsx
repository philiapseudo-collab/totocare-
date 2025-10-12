import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, CheckCircle2, AlertTriangle } from "lucide-react";

interface DataQualityIndicatorProps {
  completeness: number;
  recency: number;
  consistency: number;
}

export function DataQualityIndicator({ completeness, recency, consistency }: DataQualityIndicatorProps) {
  const overallScore = Math.round((completeness + recency + consistency) / 3);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendations = () => {
    const recs: string[] = [];
    if (completeness < 80) recs.push('Add missing health information');
    if (recency < 80) recs.push('Schedule a check-up to update records');
    if (consistency < 80) recs.push('Attend appointments regularly');
    if (recs.length === 0) recs.push('Excellent data quality - keep it up!');
    return recs;
  };

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Quality Score
        </CardTitle>
        <CardDescription>Health record completeness and accuracy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Overall Quality</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completeness</span>
              <span className="font-medium">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Recency</span>
              <span className="font-medium">{recency}%</span>
            </div>
            <Progress value={recency} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Consistency</span>
              <span className="font-medium">{consistency}%</span>
            </div>
            <Progress value={consistency} className="h-2" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Recommendations:</h4>
          <ul className="space-y-1.5">
            {getRecommendations().map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                {overallScore >= 80 ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                )}
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full" variant="outline">
          <Database className="h-4 w-4 mr-2" />
          Update Health Records
        </Button>
      </CardContent>
    </Card>
  );
}
