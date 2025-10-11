import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export function TodaysChecklist() {
  const { t } = useAppTranslation();
  const { events, loading } = useUpcomingEvents();
  
  // Filter to show only today's events
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const todaysItems = events.filter(event => event.date === today);

  const getStatusBadge = (status: string) => {
    const statusText = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return <Badge variant="outline">{statusText}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold" data-i18n="todaysChecklist.title">{t("todaysChecklist.title")}</CardTitle>
              <p className="text-sm text-muted-foreground" data-i18n="todaysChecklist.subtitle">{t("todaysChecklist.subtitle")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold" data-i18n="todaysChecklist.title">{t("todaysChecklist.title")}</CardTitle>
              <p className="text-sm text-muted-foreground" data-i18n="todaysChecklist.subtitle">{t("todaysChecklist.subtitle")}</p>
            </div>
            <Link to="/checklist-detail">
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {todaysItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p data-i18n="todaysChecklist.noTasksToday">{t("todaysChecklist.noTasksToday")}</p>
            </div>
          ) : (
          todaysItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description || item.type}</p>
                </div>
              </div>
              <div className="ml-4">
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}