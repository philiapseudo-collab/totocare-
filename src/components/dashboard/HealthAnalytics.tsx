import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export function HealthAnalytics() {
  const { t } = useAppTranslation();
  const { profile, pregnancy } = useProfile();

  // Mock data for demonstration - in production, fetch from actual records
  const weightData = [
    { week: 8, weight: 65 },
    { week: 12, weight: 67 },
    { week: 16, weight: 69 },
    { week: 20, weight: 72 },
    { week: 24, weight: 75 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg" data-i18n="healthTrends.title">
          <TrendingUp className="h-5 w-5" />
          {t("healthTrends.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="week" 
              label={{ value: t("healthTrends.week"), position: 'insideBottom', offset: -5 }}
              className="text-xs"
            />
            <YAxis 
              label={{ value: t("healthTrends.weight"), angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 text-center" data-i18n="healthTrends.trackWeight">
          {t("healthTrends.trackWeight")}
        </p>
      </CardContent>
    </Card>
  );
}
