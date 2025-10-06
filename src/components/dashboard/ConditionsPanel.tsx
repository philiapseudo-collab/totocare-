import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useConditions } from "@/hooks/useConditions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function ConditionsPanel() {
  const { conditions, loading } = useConditions();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        {conditions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No conditions tracked</p>
            <p className="text-sm text-muted-foreground mt-1">Medical conditions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conditions.slice(0, 5).map((condition) => (
              <div key={condition.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{condition.condition_name}</p>
                  {condition.diagnosed_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Since {format(new Date(condition.diagnosed_date), 'MMM d, yyyy')}
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