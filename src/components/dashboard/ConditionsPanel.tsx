import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useConditions } from "@/hooks/useConditions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export function ConditionsPanel() {
  const { t } = useAppTranslation();
  const { conditions, loading } = useConditions();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold" data-i18n="conditions.title">{t("conditions.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton type="list" count={3} />
        ) : conditions.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title={t("conditions.noConditions")}
            description={t("conditions.conditionsWillAppear")}
            iconClassName="text-primary"
          />
        ) : (
          <div className="space-y-3">
            {conditions.slice(0, 5).map((condition) => (
              <div key={condition.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{condition.condition_name}</p>
                  {condition.diagnosed_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span data-i18n="conditions.since">{t("conditions.since")}</span> {format(new Date(condition.diagnosed_date), 'MMM d, yyyy')}
                    </p>
                  )}
                  {condition.treatment && (
                    <p className="text-xs text-muted-foreground mt-1">{condition.treatment}</p>
                  )}
                </div>
                {condition.severity && (
                  <Badge 
                    variant={
                      condition.severity === 'severe' ? 'destructive' : 
                      condition.severity === 'moderate' ? 'default' : 
                      'secondary'
                    }
                    className="ml-2"
                  >
                    {condition.severity}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}