import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";

interface HealthMetricsTimelineProps {
  weightGain: number;
  bloodPressure: {
    status: string;
    average: { systolic: number; diastolic: number } | null;
    trend: string;
  };
}

export function HealthMetricsTimeline({ weightGain, bloodPressure }: HealthMetricsTimelineProps) {
  const [timeRange, setTimeRange] = useState<'30' | '60' | '90'>('30');

  // Mock data - in production, this would come from the API
  const mockData = [
    { date: 'Week 1', weight: 65, systolic: 120, diastolic: 80 },
    { date: 'Week 2', weight: 66, systolic: 118, diastolic: 78 },
    { date: 'Week 3', weight: 66.5, systolic: 122, diastolic: 82 },
    { date: 'Week 4', weight: 67, systolic: 120, diastolic: 80 },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'destructive';
      case 'low': return 'secondary';
      case 'normal': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Health Metrics Timeline</CardTitle>
            <CardDescription>Track your health measurements over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={timeRange === '30' ? 'default' : 'outline'}
              onClick={() => setTimeRange('30')}
            >
              30 Days
            </Button>
            <Button
              size="sm"
              variant={timeRange === '60' ? 'default' : 'outline'}
              onClick={() => setTimeRange('60')}
            >
              60 Days
            </Button>
            <Button
              size="sm"
              variant={timeRange === '90' ? 'default' : 'outline'}
              onClick={() => setTimeRange('90')}
            >
              90 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Weight Gain</div>
            <div className="text-2xl font-bold">{weightGain.toFixed(1)} kg</div>
            <Badge variant="outline" className="mt-2">Total</Badge>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Blood Pressure</div>
            {bloodPressure.average ? (
              <>
                <div className="text-2xl font-bold">
                  {bloodPressure.average.systolic}/{bloodPressure.average.diastolic}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getStatusColor(bloodPressure.status)}>
                    {bloodPressure.status}
                  </Badge>
                  {getTrendIcon(bloodPressure.trend)}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Trend</div>
            <div className="flex items-center gap-2">
              {getTrendIcon(bloodPressure.trend)}
              <span className="text-lg font-semibold capitalize">{bloodPressure.trend}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Based on recent readings
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Weight (kg)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="systolic"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Systolic BP"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="diastolic"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                name="Diastolic BP"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
