import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Metric {
  id: string;
  value: string;
  label: string;
  unit?: string;
}

export function KeyMetrics() {
  const metrics: Metric[] = [
    {
      id: "gestational-age",
      value: "28",
      unit: "w",
      label: "Gestational age"
    },
    {
      id: "infant-weight", 
      value: "6.8",
      unit: "kg",
      label: "Infant weight"
    },
    {
      id: "fasting-glucose",
      value: "110",
      unit: "mg/dL",
      label: "Fasting glucose"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
                {metric.unit && <span className="text-lg ml-1">{metric.unit}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1 break-words">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}