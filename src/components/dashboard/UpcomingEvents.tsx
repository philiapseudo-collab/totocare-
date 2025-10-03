import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Syringe, Calendar, FlaskConical } from "lucide-react";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { Skeleton } from "@/components/ui/skeleton";

export function UpcomingEvents() {
  const { events, loading } = useUpcomingEvents();

  const getIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return <Syringe className="w-4 h-4 text-blue-500" />;
      case "appointment":
        return <Calendar className="w-4 h-4 text-green-500" />;
      case "screening":
        return <FlaskConical className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusText = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return <Badge variant="outline">{statusText}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
          <p className="text-sm text-muted-foreground">Next 7 days</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
        <p className="text-sm text-muted-foreground">Next 7 days</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming events in the next 7 days</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex flex-col sm:flex-row sm:items-start justify-between py-3 border-b border-border last:border-0 gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {getIcon(event.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground break-words">{event.title}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground mt-1">
                    <span>{event.date}</span>
                    {event.location && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{event.location}</span>
                      </>
                    )}
                    {event.description && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{event.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 self-start sm:self-center">
                {getStatusBadge(event.status)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}