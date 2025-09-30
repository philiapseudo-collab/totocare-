import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Droplet, Pill, Heart, Clock, Syringe } from "lucide-react";
import { Link } from "react-router-dom";

const ChecklistDetail = () => {
  const [quickLogData, setQuickLogData] = useState({
    task: "Hydration",
    when: "Now",
    details: "e.g., 250ml water",
    assignTo: "Mother"
  });

  const checklistItems = [
    {
      id: "hydration",
      title: "Hydration",
      description: "Target • 8 glasses water",
      progress: "0/8",
      status: "track",
      icon: <Droplet className="w-5 h-5 text-blue-500" />,
      actions: [{ label: "Log", variant: "default" }]
    },
    {
      id: "prenatal-vitamin",
      title: "Prenatal vitamin",
      description: "Mother • Once today",
      status: "due",
      icon: <Pill className="w-5 h-5 text-orange-500" />,
      actions: [{ label: "Mark done", variant: "outline" }]
    },
    {
      id: "fetal-movement",
      title: "Fetal movement",
      description: "Mother • Count kicks",
      status: "track",
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      actions: [{ label: "Start", variant: "outline" }]
    },
    {
      id: "infant-feeding",
      title: "Infant feeding",
      description: "Next feed window in ~2h",
      status: "pending",
      icon: <Clock className="w-5 h-5 text-purple-500" />,
      actions: [{ label: "Log feed", variant: "outline" }]
    },
    {
      id: "vaccine-reminder",
      title: "Vaccine reminder",
      description: "Infant • DTaP Dose 2 due Tue, Oct 22",
      status: "scheduled",
      icon: <Syringe className="w-5 h-5 text-green-500" />,
      actions: [{ label: "View details", variant: "outline" }]
    }
  ];

  const suggestions = [
    {
      title: "Short walk",
      description: "15 minutes light activity",
      action: "Add"
    },
    {
      title: "Skin-to-skin",
      description: "Infant bonding time",
      action: "Add"
    }
  ];

  const reminders = [
    {
      title: "Glucose check",
      description: "2 hours after meal",
      status: "Later"
    },
    {
      title: "Prenatal appointment",
      description: "Wed, Oct 23",
      status: "Upcoming"
    }
  ];

  const getStatusBadge = (status: string, progress?: string) => {
    if (progress) {
      return <Badge variant="outline" className="text-muted-foreground">{progress}</Badge>;
    }
    
    switch (status) {
      case "due":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/10">Due</Badge>;
      case "track":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Track</Badge>;
      case "pending":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Pending</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                <span>Dashboard</span>
                <span>›</span>
                <span className="text-foreground font-medium">Today's Checklist</span>
              </div>
            </div>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Today's Checklist</CardTitle>
                <p className="text-muted-foreground">Daily tasks across mother and infant</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        {item.icon}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status, item.progress)}
                        <div className="flex gap-2">
                          {item.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant={action.variant as "default" | "outline"}
                              size="sm"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task">Task</Label>
                    <Select value={quickLogData.task} onValueChange={(value) => setQuickLogData(prev => ({ ...prev, task: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hydration">Hydration</SelectItem>
                        <SelectItem value="Prenatal vitamin">Prenatal vitamin</SelectItem>
                        <SelectItem value="Fetal movement">Fetal movement</SelectItem>
                        <SelectItem value="Infant feeding">Infant feeding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="when">When</Label>
                    <Select value={quickLogData.when} onValueChange={(value) => setQuickLogData(prev => ({ ...prev, when: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Now">Now</SelectItem>
                        <SelectItem value="1 hour ago">1 hour ago</SelectItem>
                        <SelectItem value="2 hours ago">2 hours ago</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details">Details</Label>
                    <Input
                      id="details"
                      placeholder="e.g., 250ml water"
                      value={quickLogData.details}
                      onChange={(e) => setQuickLogData(prev => ({ ...prev, details: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignTo">Assign to</Label>
                    <Select value={quickLogData.assignTo} onValueChange={(value) => setQuickLogData(prev => ({ ...prev, assignTo: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Infant">Infant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Add Log</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    </div>
                    <Button variant="outline" size="sm">{suggestion.action}</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Reminders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{reminder.title}</h4>
                      <p className="text-sm text-muted-foreground">{reminder.description}</p>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">{reminder.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Today's Checklist Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Today's Checklist</CardTitle>
                <p className="text-sm text-muted-foreground">From your dashboard</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hydration</h4>
                    <p className="text-sm text-muted-foreground">8 glasses of water</p>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">0/8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Prenatal vitamin</h4>
                    <p className="text-sm text-muted-foreground">Once daily</p>
                  </div>
                  <Badge className="bg-warning/10 text-warning hover:bg-warning/10">Due</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Fetal movement</h4>
                    <p className="text-sm text-muted-foreground">Count kicks</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Track</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tips & Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Tips & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Keeping a helpful journal</h4>
                  <p className="text-sm text-muted-foreground">Brief notes, consistent tags</p>
                </div>
                <div>
                  <h4 className="font-medium">What to log daily</h4>
                  <p className="text-sm text-muted-foreground">Sleep, mood, symptoms</p>
                </div>
                <div>
                  <h4 className="font-medium">Privacy overview</h4>
                  <p className="text-sm text-muted-foreground">Your notes are private</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistDetail;