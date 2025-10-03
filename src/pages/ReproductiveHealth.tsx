import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Heart, Thermometer } from "lucide-react";
import { useReproductiveHealth } from "@/hooks/useReproductiveHealth";

const ReproductiveHealth = () => {
  const { records, loading } = useReproductiveHealth();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
              <span>Home</span>
              <span>›</span>
              <span>Dashboard</span>
              <span>›</span>
              <span className="text-foreground font-medium">Reproductive Health</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Reproductive Health</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Export
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cycle & Symptoms */}
            <Card>
              <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <CardTitle className="text-lg font-semibold mb-2 sm:mb-0">Cycle & Symptoms</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">Tracking</Button>
                      <Button size="sm" className="bg-primary text-primary-foreground">Current Cycle</Button>
                      <Button variant="outline" size="sm">History</Button>
                    </div>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading reproductive health data...</div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No reproductive health records found</p>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Entry
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {records[0] && (
                        <>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Cycle day</p>
                            <p className="text-2xl font-bold">Day {records[0].menstrual_cycle_day || 'N/A'} of {records[0].cycle_length || 28}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                            <p className="text-lg font-medium">{records[0].temperature ? `${records[0].temperature}°F` : 'Not recorded'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Flow</p>
                            <p className="text-lg font-medium capitalize">{records[0].flow_intensity || 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {records[0] && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Mood</p>
                          <p className="text-lg font-medium capitalize">{records[0].mood || 'Not recorded'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Symptoms</p>
                          <p className="text-lg font-medium break-words">
                            {records[0].symptoms?.join(', ') || 'None recorded'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Notes</p>
                          <p className="text-lg font-medium break-words">{records[0].notes || 'No notes'}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 gap-3">
                  <Button variant="outline" className="w-full sm:w-auto">Import from app</Button>
                  <Button className="w-full sm:w-auto">Log Symptom</Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Reproductive Health Summary</CardTitle>
                <p className="text-sm text-muted-foreground">{records.length} records</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {records.length > 0 ? (
                  <>
                    <div>
                      <h4 className="font-medium">Latest Record</h4>
                      <p className="text-sm">{new Date(records[0].record_date).toLocaleDateString()}</p>
                      <Badge variant="secondary">Cycle Day {records[0].menstrual_cycle_day || 'N/A'}</Badge>
                    </div>
                    <div className="bg-accent p-3 rounded-lg text-sm text-muted-foreground">
                      <strong>Tip:</strong> Regular tracking helps identify patterns and potential issues.
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Start tracking to see your summary</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReproductiveHealth;