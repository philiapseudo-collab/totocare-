import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Scale, Ruler, Calendar, Syringe } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface InfantData {
  name: string;
  days: number;
  weeks: number;
  months: number;
  currentWeight?: number;
  currentHeight?: number;
  weightGain?: number;
  growthAssessment: {
    weightStatus: string;
    heightStatus: string;
    trend: string;
  };
  upcomingMilestones: string[];
  vaccinationSchedule: Array<{
    vaccine: string;
    dueAge: string;
    status: string;
  }>;
}

interface InfantGrowthTrackerProps {
  infantData: InfantData;
}

export function InfantGrowthTracker({ infantData }: InfantGrowthTrackerProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-500';
      case 'below_average': return 'bg-yellow-500';
      case 'above_average': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'below_average': 'Below Average',
      'above_average': 'Above Average',
      'normal': 'Normal'
    };
    return statusMap[status] || status;
  };

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Infant Growth Tracker
          </span>
          <Badge className={getStatusColor(infantData.growthAssessment.weightStatus)}>
            {getStatusBadge(infantData.growthAssessment.weightStatus)}
          </Badge>
        </CardTitle>
        <CardDescription>{infantData.name}'s development and growth</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Age (Days)</div>
            <div className="text-2xl font-bold">{infantData.days}</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Age (Weeks)</div>
            <div className="text-2xl font-bold">{infantData.weeks}</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Age (Months)</div>
            <div className="text-2xl font-bold">{infantData.months}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {infantData.currentWeight && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Current Weight</span>
              </div>
              <div className="text-2xl font-bold">{infantData.currentWeight} kg</div>
              {infantData.weightGain && (
                <div className="text-sm text-muted-foreground mt-1">
                  +{infantData.weightGain.toFixed(2)} kg gained
                </div>
              )}
            </div>
          )}

          {infantData.currentHeight && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Current Height</span>
              </div>
              <div className="text-2xl font-bold">{infantData.currentHeight} cm</div>
            </div>
          )}
        </div>

        {infantData.upcomingMilestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Developmental Milestones
            </h4>
            <ul className="space-y-1.5">
              {infantData.upcomingMilestones.map((milestone, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                  <div className="w-4 h-4 rounded border-2 border-muted-foreground" />
                  {milestone}
                </li>
              ))}
            </ul>
          </div>
        )}

        {infantData.vaccinationSchedule.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Vaccination Schedule
            </h4>
            <div className="space-y-2">
              {infantData.vaccinationSchedule.map((vax, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span className="font-medium">{vax.vaccine}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{vax.dueAge}</span>
                    <Badge variant={vax.status === 'due' ? 'destructive' : 'outline'}>
                      {vax.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
