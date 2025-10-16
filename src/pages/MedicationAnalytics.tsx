import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MedicationAdherenceCard } from "@/components/analytics/MedicationAdherenceCard";
import { MedicationAdherenceChart } from "@/components/analytics/MedicationAdherenceChart";
import { useMedicationAdherence } from "@/hooks/useMedicationAdherence";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Calendar, Pill } from "lucide-react";

const MedicationAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const { actions, isLoading } = useMedicationAdherence(timeRange);

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'taken':
        return <Badge className="bg-success text-success-foreground">Taken</Badge>;
      case 'skipped':
        return <Badge className="bg-warning text-warning-foreground">Skipped</Badge>;
      case 'missed':
        return <Badge className="bg-error text-error-foreground">Missed</Badge>;
      case 'snoozed':
        return <Badge variant="outline">Snoozed</Badge>;
      default:
        return <Badge variant="secondary">{actionType}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Pill className="h-8 w-8" />
            Medication Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your medication adherence and patterns
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MedicationAdherenceCard timeRange={timeRange} />
        <MedicationAdherenceChart timeRange={timeRange} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medication activity recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.slice(0, 20).map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(action.action_time), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{getActionBadge(action.action_type)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(parseISO(action.scheduled_time), 'HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {action.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationAnalytics;
