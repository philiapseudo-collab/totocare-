import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Calendar, FileText, AlertCircle } from "lucide-react";

const Screenings = () => {
  const screenings = [
    {
      screening: "Pap Smear",
      patient: "Mother",
      lastDone: "Mar 12, 2023",
      nextDue: "Mar 2026",
      status: "completed" as const
    },
    {
      screening: "Gestational Diabetes",
      patient: "Mother", 
      lastDone: "—",
      nextDue: "Week 24-28",
      status: "scheduled" as const
    },
    {
      screening: "Newborn Hearing",
      patient: "Infant",
      lastDone: "Oct 05, 2025",
      nextDue: "Completed",
      status: "completed" as const
    },
    {
      screening: "Maternal Anemia",
      patient: "Mother",
      lastDone: "Aug 30, 2025", 
      nextDue: "Feb 2026",
      status: "completed" as const
    }
  ];

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
                <div className="space-y-4">
                  {screenings.map((screening, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <h3 className="font-medium">{screening.screening}</h3>
                              <p className="text-sm text-muted-foreground">{screening.patient}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Last Done</p>
                          <p className="font-medium">{screening.lastDone}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Next Due</p>
                          <p className="font-medium">{screening.nextDue}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <StatusBadge status={screening.status}>
                            {screening.status}
                          </StatusBadge>
                          <div className="flex space-x-2">
                            {screening.status === "scheduled" ? (
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
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Recommendations</CardTitle>
                  <Button variant="outline" size="sm">Guidance</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className={`w-5 h-5 ${rec.action === "OK" ? "text-success" : "text-warning"}`} />
                          <div>
                            <h3 className="font-medium">{rec.title}</h3>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {rec.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Screening Details</CardTitle>
                <p className="text-sm text-muted-foreground">Selected</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Screening</h4>
                  <p className="text-sm font-medium">Pap Smear</p>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <p className="text-sm font-medium">Up to date</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Last performed</label>
                    <p className="font-medium">Mar 12, 2023 • Normal</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Next due</label>
                    <p className="font-medium">Mar 2026</p>
                  </div>
                </div>
                <div className="bg-accent p-3 rounded-lg text-sm text-muted-foreground">
                  <strong>Tip:</strong> You can upload a result PDF or request records from your clinic.
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Upload Result</Button>
                  <Button size="sm" className="flex-1">Book Appointment</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">History</CardTitle>
                <p className="text-sm text-muted-foreground">Logs</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">Pap Smear • Normal</h4>
                  <p className="text-sm text-muted-foreground">Mar 12, 2023 • Dr. Chen • Result: NILM</p>
                  <Button variant="outline" size="sm" className="mt-1">View</Button>
                </div>
                <div>
                  <h4 className="font-medium">Maternal Anemia Panel</h4>
                  <p className="text-sm text-muted-foreground">Aug 30, 2025 • Hb 11.5 g/dL • Mild anemia</p>
                  <Button variant="outline" size="sm" className="mt-1">View</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dr. Aisha Rao</h4>
                    <p className="text-sm text-muted-foreground">OB-GYN • City Health Clinic</p>
                  </div>
                  <Button variant="outline" size="sm">Message</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Nurse Daniel</h4>
                    <p className="text-sm text-muted-foreground">Lab Coordinator</p>
                  </div>
                  <Button variant="outline" size="sm">Share Results</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screenings;