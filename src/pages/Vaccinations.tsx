import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Calendar, AlertCircle } from "lucide-react";

const Vaccinations = () => {
  const vaccinations = [
    {
      vaccine: "DTaP",
      dose: "Dose 2",
      status: "due" as const,
      dueDate: "Oct 22, 2025",
      clinic: "Happy Kids Clinic",
      provider: "Dr. Noah Chen"
    },
    {
      vaccine: "Polio (IPV)",
      dose: "Dose 1", 
      status: "overdue" as const,
      dueDate: "Oct 15, 2025",
      clinic: "City Health Center",
      provider: "Dr. Smith"
    },
    {
      vaccine: "Hib",
      dose: "Dose 2",
      status: "due" as const,
      dueDate: "Nov 05, 2025",
      clinic: "Happy Kids Clinic",
      provider: "Dr. Noah Chen"
    }
  ];

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
              <span className="text-foreground font-medium">Vaccinations • 3 Due</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Due Vaccinations</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Export
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Vaccination
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
                  <CardTitle className="text-lg font-semibold">Due Vaccinations</CardTitle>
                  <div className="flex space-x-2">
                    <StatusBadge status="due">Due</StatusBadge>
                    <StatusBadge status="overdue">Overdue</StatusBadge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground mb-2 sm:mb-0">3 items need attention</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Send Reminder</Button>
                    <Button size="sm" className="w-full sm:w-auto">Mark All Completed</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vaccinations.map((vaccination, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            {vaccination.status === "overdue" ? (
                              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                            ) : (
                              <Calendar className="w-5 h-5 text-warning flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <h3 className="font-medium">{vaccination.vaccine}</h3>
                              <p className="text-sm text-muted-foreground">{vaccination.dose}</p>
                            </div>
                          </div>
                          <StatusBadge status={vaccination.status} className="self-start sm:self-center">
                            {vaccination.status}
                          </StatusBadge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="text-left sm:text-right">
                            <p className="font-medium">{vaccination.dueDate}</p>
                            <p className="text-sm text-muted-foreground truncate">{vaccination.clinic}</p>
                          </div>
                          <div className="flex gap-2">
                            {vaccination.status === "overdue" ? (
                              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Schedule</Button>
                            ) : (
                              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Complete</Button>
                            )}
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Remind</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-medium">DTaP • Dose 2</h3>
                        <p className="text-sm text-muted-foreground break-words">
                          Oct 22, 2025 • Happy Kids Clinic • Provider: Dr. Noah Chen
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">View</Button>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">Skip</Button>
                      <Button size="sm" className="w-full sm:w-auto">Mark Completed</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Update</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Vaccine</label>
                  <p className="font-medium">DTaP</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Dose</label>
                    <p className="font-medium">Dose 2</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Due date</label>
                    <p className="font-medium">Oct 22, 2025</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Clinic</label>
                    <p className="font-medium">Happy Kids Clinic</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Provider</label>
                    <p className="font-medium">Dr. Noah Chen</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Outcome</label>
                  <p className="font-medium">Pending</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Notes</label>
                  <p className="text-sm">Add any observation or reason for delay.</p>
                </div>
                <div className="text-sm text-muted-foreground bg-accent p-3 rounded-lg">
                  You have 1 overdue item. Consider scheduling soon.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Care Guidance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Managing overdue vaccinations</h4>
                  <p className="text-sm text-muted-foreground">Safe catch-up plan for infants</p>
                  <Button variant="outline" size="sm" className="mt-2">Open</Button>
                </div>
                <div>
                  <h4 className="font-medium">Vaccine schedule reference</h4>
                  <p className="text-sm text-muted-foreground">CDC-based infant schedule, localized</p>
                  <Button variant="outline" size="sm" className="mt-2">Open</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vaccinations;