import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

interface AppointmentsSummaryCardProps {
  total: number;
  upcoming: number;
  completed: number;
}

export function AppointmentsSummaryCard({ total, upcoming, completed }: AppointmentsSummaryCardProps) {
  const attendanceRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const cancelled = total - completed - upcoming;

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Appointments Summary
        </CardTitle>
        <CardDescription>Your appointment history and attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{attendanceRate}%</div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
            </div>
            <Progress value={attendanceRate} className="mt-4 h-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{completed}</span>
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{upcoming}</span>
            </div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </div>
        </div>

        {cancelled > 0 && (
          <div className="p-3 bg-red-500/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Cancelled/Missed</span>
              </div>
              <span className="text-lg font-bold text-red-600">{cancelled}</span>
            </div>
          </div>
        )}

        <Button className="w-full" variant="default">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule New Appointment
        </Button>
      </CardContent>
    </Card>
  );
}
