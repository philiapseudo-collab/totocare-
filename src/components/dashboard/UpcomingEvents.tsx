import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Syringe, Calendar, FlaskConical } from "lucide-react";

interface UpcomingEvent {
  id: string;
  title: string;
  type: "vaccination" | "appointment" | "screening";
  target: "Infant" | "Mother";
  date: string;
  location?: string;
  description?: string;
  status: "scheduled" | "check-in" | "reminder";
  icon: React.ReactNode;
}

export function UpcomingEvents() {
  const upcomingEvents: UpcomingEvent[] = [
    {
      id: "dtap-dose-2",
      title: "DTaP Dose 2",
      type: "vaccination",
      target: "Infant",
      date: "Tue, Oct 22",
      location: "Happy Kids Clinic",
      status: "scheduled",
      icon: <Syringe className="w-4 h-4 text-blue-500" />
    },
    {
      id: "prenatal-visit",
      title: "Prenatal Visit",
      type: "appointment",
      target: "Mother",
      date: "Wed, Oct 23",
      description: "Week 28 check",
      status: "check-in",
      icon: <Calendar className="w-4 h-4 text-green-500" />
    },
    {
      id: "glucose-screening",
      title: "Glucose Screening",
      type: "screening",
      target: "Mother",
      date: "Fri, Oct 25",
      description: "Fasting required",
      status: "reminder",
      icon: <FlaskConical className="w-4 h-4 text-purple-500" />
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>;
      case "check-in":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Check-in</Badge>;
      case "reminder":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Reminder</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
        <p className="text-sm text-muted-foreground">Next 7 days</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="flex flex-col sm:flex-row sm:items-start justify-between py-3 border-b border-border last:border-0 gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {event.icon}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground break-words">{event.title}</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-2">
                    <span>{event.target}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{event.date}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  {event.description && (
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{event.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 self-start sm:self-center">
              {getStatusBadge(event.status)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}