import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Stethoscope, Heart, Brain, Activity } from "lucide-react";

const Conditions = () => {
  const conditions = [
    {
      condition: "Gestational Diabetes Risk",
      status: "Monitoring" as const,
      onset: "Week 20",
      lastUpdate: "Oct 02, 2025",
      severity: "Mild",
      management: "Diet control"
    },
    {
      condition: "Maternal Anemia", 
      status: "Mild" as const,
      onset: "Pre-pregnancy",
      lastUpdate: "Aug 30, 2025",
      severity: "Mild",
      management: "Oral Iron • Daily"
    },
    {
      condition: "Hypertension (History)",
      status: "Resolved" as const,
      onset: "2019",
      lastUpdate: "Jan 05, 2024",
      severity: "Resolved",
      management: "Lifestyle changes"
    }
  ];

  const careTeam = [
    {
      name: "Dr. Aisha Rao",
      role: "OB-GYN",
      clinic: "City Health Clinic",
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Nurse Daniel",
      role: "Lab Coordinator", 
      clinic: "",
      avatar: "/api/placeholder/40/40"
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
              <span>Conditions</span>
              <span>›</span>
              <span className="text-foreground font-medium">Mother</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Conditions</h1>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Condition
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Condition Summary */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Condition Summary</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Mother</Button>
                    <Button size="sm" className="bg-primary text-primary-foreground">Mother</Button>
                    <Button variant="outline" size="sm">Infant</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Active Conditions</p>
                    <p className="text-xs text-muted-foreground">Mild • Stable</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">Medications</p>
                    <p className="text-xs text-muted-foreground">Prenatal vitamins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">None</p>
                    <p className="text-sm text-muted-foreground">Allergies</p>
                    <p className="text-xs text-muted-foreground">No known allergies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conditions List */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Conditions List</CardTitle>
                  <Button variant="outline" size="sm">Active & History</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {condition.condition.includes("Diabetes") ? (
                              <Heart className="w-5 h-5 text-error" />
                            ) : condition.condition.includes("Anemia") ? (
                              <Activity className="w-5 h-5 text-warning" />
                            ) : (
                              <Stethoscope className="w-5 h-5 text-success" />
                            )}
                            <div>
                              <h3 className="font-medium">{condition.condition}</h3>
                              <p className="text-sm text-muted-foreground">{condition.management}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <StatusBadge status={
                            condition.status === "Monitoring" ? "due" : 
                            condition.status === "Resolved" ? "completed" : "scheduled"
                          }>
                            {condition.status}
                          </StatusBadge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Onset</p>
                          <p className="font-medium">{condition.onset}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Last Update</p>
                          <p className="font-medium">{condition.lastUpdate}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            {condition.status === "Resolved" ? "Details" : condition.status === "Monitoring" ? "Open" : "Add Lab"}
                          </Button>
                        </div>
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
                <CardTitle className="text-lg font-semibold">Condition Detail</CardTitle>
                <p className="text-sm text-muted-foreground">Maternal Anemia</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Severity</label>
                    <p className="font-medium">Mild</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Management</label>
                    <p className="font-medium">Oral Iron • Daily</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Next Check</label>
                    <p className="font-medium">Week 28 • CBC</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Responsible Clinician</label>
                    <p className="font-medium">Dr. Aisha Rao</p>
                  </div>
                </div>
                <div className="bg-accent p-3 rounded-lg text-sm text-muted-foreground">
                  Latest: Hb 11.5 g/dL on Aug 30, 2025. Advise iron-rich diet and vitamin C.
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Schedule Lab</Button>
                  <Button size="sm" className="flex-1">Mark Resolved</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <p className="text-sm text-muted-foreground">Logs</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">CBC Ordered</h4>
                  <p className="text-sm text-muted-foreground">Oct 02, 2025 • Week 22 • Follow-up in 2 weeks</p>
                  <Button variant="outline" size="sm" className="mt-1">View</Button>
                </div>
                <div>
                  <h4 className="font-medium">Lab Result Added</h4>
                  <p className="text-sm text-muted-foreground">Aug 30, 2025 • Hb 11.5 g/dL • Ferritin 30 ng/mL</p>
                  <Button variant="outline" size="sm" className="mt-1">Open</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Care Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {careTeam.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {member.role} {member.clinic && `• ${member.clinic}`}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {index === 0 ? "Message" : "Share Plan"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conditions;