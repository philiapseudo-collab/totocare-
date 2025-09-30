import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Activity, TrendingUp, Brain } from "lucide-react";

interface Condition {
  id: string;
  name: string;
  status: "monitoring" | "on-meds" | "watch" | "in-therapy";
  icon: React.ReactNode;
  details: { label: string; value: string }[];
}

export function ConditionsPanel() {
  const conditions: Condition[] = [
    {
      id: "gestational-diabetes",
      name: "Gestational Diabetes",
      status: "monitoring",
      icon: <Droplet className="w-4 h-4 text-blue-500" />,
      details: [
        { label: "Fasting", value: "110" },
        { label: "Postprandial", value: "145" },
        { label: "Metformin", value: "500mg" }
      ]
    },
    {
      id: "anemia",
      name: "Anemia", 
      status: "on-meds",
      icon: <Activity className="w-4 h-4 text-red-500" />,
      details: [
        { label: "Hb", value: "10.2 g/dL" },
        { label: "Iron", value: "60mg" }
      ]
    },
    {
      id: "hypertensive-disorders",
      name: "Hypertensive Disorders",
      status: "watch",
      icon: <TrendingUp className="w-4 h-4 text-orange-500" />,
      details: [
        { label: "BP", value: "142/92" },
        { label: "Labetalol", value: "" }
      ]
    },
    {
      id: "depression-anxiety",
      name: "Depression & Anxiety",
      status: "in-therapy",
      icon: <Brain className="w-4 h-4 text-purple-500" />,
      details: [
        { label: "PHQ-9", value: "6" },
        { label: "GAD-7", value: "5" }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "monitoring":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Monitoring</Badge>;
      case "on-meds":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">On meds</Badge>;
      case "watch":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Watch</Badge>;
      case "in-therapy":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">In therapy</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.map((condition) => (
          <div key={condition.id} className="p-3 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {condition.icon}
                <h4 className="font-medium text-sm">{condition.name}</h4>
              </div>
              {getStatusBadge(condition.status)}
            </div>
            
            <div className="space-y-1">
              {condition.details.map((detail, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{detail.label}:</span>
                  <span className="font-medium">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}