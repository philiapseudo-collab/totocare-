import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, FileText, Clock } from "lucide-react";
import { useClinicVisits } from "@/hooks/useClinicVisits";
import { format } from "date-fns";

const ClinicVisits = () => {
  const { visits, loading } = useClinicVisits();

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
              <span className="text-foreground font-medium">Clinic Visits</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Clinic Visits</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Export
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Visit
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Visit Log</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant="outline">Upcoming</Badge>
                    <Badge variant="outline">Completed</Badge>
                    <Badge variant="outline">Missed</Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground mb-2 sm:mb-0">1 upcoming • 4 completed</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Schedule</Button>
                    <Button size="sm" className="w-full sm:w-auto">Send Reminder</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading clinic visits...</div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No clinic visits found</p>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Visit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.map((visit) => (
                      <div key={visit.id} className="border border-border rounded-lg p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              {visit.status === "scheduled" ? (
                                <Calendar className="w-5 h-5 text-warning flex-shrink-0" />
                              ) : visit.status === "completed" ? (
                                <FileText className="w-5 h-5 text-success flex-shrink-0" />
                              ) : (
                                <Clock className="w-5 h-5 text-error flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <h3 className="font-medium">{format(new Date(visit.visit_date), 'MMM dd, yyyy')}</h3>
                                <p className="text-sm text-muted-foreground break-words">
                                  {visit.visit_type}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {visit.blood_pressure && (
                              <div className="text-left sm:text-center">
                                <p className="font-medium break-words">BP: {visit.blood_pressure}</p>
                                {visit.weight && (
                                  <p className="text-sm text-muted-foreground">Weight: {visit.weight}kg</p>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="capitalize">
                                {visit.status.replace('_', ' ')}
                              </Badge>
                              <div className="flex gap-2">
                                {visit.status === "scheduled" ? (
                                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Reschedule</Button>
                                ) : visit.status === "completed" ? (
                                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Notes</Button>
                                ) : (
                                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Rebook</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Clinic</label>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Any
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Any
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Visit type</label>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Vaccination
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Date range</label>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Last 6 months
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">Clear</Button>
                  <Button size="sm" className="w-full sm:w-auto">Apply</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Visit Summary</CardTitle>
                <p className="text-sm text-muted-foreground">{visits.length} total</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {visits.length > 0 && visits.find(v => v.status === 'scheduled') && (
                  <div>
                    <h4 className="font-medium">Next visit</h4>
                    <p className="text-sm font-medium">
                      {format(new Date(visits.find(v => v.status === 'scheduled')!.visit_date), 'MMM dd, yyyy')} • {visits.find(v => v.status === 'scheduled')!.visit_type}
                    </p>
                  </div>
                )}
                <div className="text-sm text-muted-foreground bg-accent p-3 rounded-lg">
                  <strong>Tip:</strong> Keep all records in one place. Upload receipts or visit notes after each appointment.
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Manage Providers</Button>
                  <Button size="sm" className="flex-1">Add Document</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicVisits;