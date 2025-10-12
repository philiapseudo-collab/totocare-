import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Syringe, Pill, AlertCircle } from "lucide-react";

interface CarePlanStatusProps {
  pendingScreenings: number;
  dueVaccinations: number;
}

export function CarePlanStatus({ pendingScreenings, dueVaccinations }: CarePlanStatusProps) {
  const totalPending = pendingScreenings + dueVaccinations;

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clipboard className="h-5 w-5" />
            Care Plan Status
          </span>
          {totalPending > 0 && (
            <Badge variant="destructive">{totalPending} Pending</Badge>
          )}
        </CardTitle>
        <CardDescription>Overview of your care requirements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clipboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Pending Screenings</div>
                <div className="text-sm text-muted-foreground">Tests and examinations due</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={pendingScreenings > 0 ? 'destructive' : 'outline'}>
                {pendingScreenings}
              </Badge>
              {pendingScreenings > 0 && (
                <Button size="sm" variant="outline">Schedule</Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Syringe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Due Vaccinations</div>
                <div className="text-sm text-muted-foreground">Immunizations needed</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={dueVaccinations > 0 ? 'destructive' : 'outline'}>
                {dueVaccinations}
              </Badge>
              {dueVaccinations > 0 && (
                <Button size="sm" variant="outline">Schedule</Button>
              )}
            </div>
          </div>
        </div>

        {totalPending > 0 && (
          <div className="p-3 bg-orange-500/10 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Action Required:</span>
              <span className="text-muted-foreground ml-1">
                You have {totalPending} pending care item{totalPending !== 1 ? 's' : ''} that need attention.
              </span>
            </div>
          </div>
        )}

        <Button className="w-full" variant="default">
          <Pill className="h-4 w-4 mr-2" />
          View Full Care Plan
        </Button>
      </CardContent>
    </Card>
  );
}
