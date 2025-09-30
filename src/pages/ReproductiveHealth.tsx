import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Heart, Thermometer } from "lucide-react";

const ReproductiveHealth = () => {
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Cycle day</p>
                    <p className="text-2xl font-bold">Day 12 of 28</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Fertile window</p>
                    <p className="text-lg font-medium">Sep 18 - Sep 23</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Next period (est.)</p>
                    <p className="text-lg font-medium">Oct 02, 2025</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Mood</p>
                    <p className="text-lg font-medium">Calm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Energy</p>
                    <p className="text-lg font-medium">Moderate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Symptoms</p>
                    <p className="text-lg font-medium break-words">Mild cramps, tender breasts</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Thermometer className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Basal Body Temp</p>
                        <p className="text-sm text-muted-foreground">97.8°F this morning • trending stable</p>
                      </div>
                    </div>
                    <Button size="sm">Today</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Cervical Mucus</p>
                        <p className="text-sm text-muted-foreground">Egg-white consistency • fertile</p>
                      </div>
                    </div>
                    <Button size="sm">Logged</Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 gap-3">
                  <Button variant="outline" className="w-full sm:w-auto">Import from app</Button>
                  <Button className="w-full sm:w-auto">Log Symptom</Button>
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Goals</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-primary text-primary-foreground">Conceive</Button>
                  <Button variant="outline" size="sm">Wellness</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Target window</p>
                    <p className="font-medium">This cycle • Sep 18 - Sep 23</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Partner reminders</p>
                    <p className="font-medium">Enabled</p>
                  </div>
                </div>
                <div className="bg-accent p-3 rounded-lg text-sm text-muted-foreground">
                  <strong>Tip:</strong> Sync your fertile window with calendar apps to avoid missing key days.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Reproductive Health Summary</CardTitle>
                <p className="text-sm text-muted-foreground">Overview</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Average cycle length</h4>
                  <p className="text-sm">28 days • last 6 cycles</p>
                  <Badge variant="secondary">Stable</Badge>
                </div>
                <div>
                  <h4 className="font-medium">Ovulation estimate</h4>
                  <p className="text-sm">Day 14 • based on temperature shift</p>
                  <Badge variant="secondary">Projected</Badge>
                </div>
                <div>
                  <h4 className="font-medium">Screenings status</h4>
                  <p className="text-sm">Pap smear up to date • next due Mar 2026</p>
                  <Button variant="outline" size="sm" className="mt-1">View</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Medications & Supplements</CardTitle>
                <p className="text-sm text-muted-foreground">Daily</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Prenatal Vitamin</p>
                      <p className="text-sm text-muted-foreground">One-a-day • Daily • Self</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Iron (Ferrous Sulfate)</p>
                      <p className="text-sm text-muted-foreground">65 mg • Every other day • Dr. Aisha Rao</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Manage</Button>
                  <Button size="sm" className="flex-1">Add Medication</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">Period start</h4>
                  <p className="text-sm text-muted-foreground">Sep 21, 2025 • Flow: Light</p>
                  <Badge variant="outline">Cycle Day 1</Badge>
                </div>
                <div>
                  <h4 className="font-medium">Intercourse</h4>
                  <p className="text-sm text-muted-foreground">Protected • Sep 19, 2025</p>
                  <Badge variant="outline">Logged</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReproductiveHealth;