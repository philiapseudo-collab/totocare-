import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function ConditionsPanel() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No conditions tracked</p>
          <p className="text-sm text-muted-foreground mt-1">Medical conditions will appear here</p>
        </div>
      </CardContent>
    </Card>
  );
}