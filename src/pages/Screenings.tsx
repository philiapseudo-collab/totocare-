import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { useScreenings } from "@/hooks/useScreenings";
import { format } from "date-fns";

const Screenings = () => {
  const { screenings, loading } = useScreenings();

  const recommendations = [
    {
      title: "Influenza screening recommended",
      description: "Flu season approaching • consider vaccination and check symptoms",
      action: "Learn more"
    },
    {
      title: "Rh factor verified",
      description: "Completed in first trimester • no action needed",
      action: "OK"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
              <span>Home</span>
              <span>›</span>
              <span>Dashboard</span>
              <span>›</span>
              <span className="text-foreground font-medium">Screenings</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Screenings</h1>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Screening
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming & Due */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Upcoming & Due</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Priority</Button>
                    <Button size="sm" className="bg-primary text-primary-foreground">All</Button>
                    <Button variant="outline" size="sm">Mother</Button>
                    <Button variant="outline" size="sm">Infant</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading screenings...</div>
                ) : screenings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No screenings found</p>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Screening
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {screenings.map((screening) => (
                      <div key={screening.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <h3 className="font-medium">{screening.screening_type}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{screening.status}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Scheduled</p>
                            <p className="font-medium">{format(new Date(screening.scheduled_date), 'MMM dd, yyyy')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="font-medium">{screening.completed_date ? format(new Date(screening.completed_date), 'MMM dd, yyyy') : 'Pending'}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="capitalize">
                              {screening.status}
                            </Badge>
                            <div className="flex space-x-2">
                              {screening.status === "due" ? (
                                <Button variant="outline" size="sm">Schedule</Button>
                              ) : screening.status === "completed" ? (
                                <Button variant="outline" size="sm">View</Button>
                              ) : (
                                <Button variant="outline" size="sm">Report</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {screenings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Screening Details</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Screening</h4>
                    <p className="text-sm font-medium">{screenings[0].screening_type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Status</h4>
                    <p className="text-sm font-medium capitalize">{screenings[0].status}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Scheduled</label>
                      <p className="font-medium">{format(new Date(screenings[0].scheduled_date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Completed</label>
                      <p className="font-medium">{screenings[0].completed_date ? format(new Date(screenings[0].completed_date), 'MMM dd, yyyy') : 'Pending'}</p>
                    </div>
                  </div>
                  {screenings[0].notes && (
                    <div>
                      <label className="text-sm text-muted-foreground">Notes</label>
                      <p className="text-sm">{screenings[0].notes}</p>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">Upload Result</Button>
                    <Button size="sm" className="flex-1">Book Appointment</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screenings;