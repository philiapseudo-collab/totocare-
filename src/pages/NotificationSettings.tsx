import { useState, useEffect } from "react";
import { Bell, Volume2, TestTube, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { medicationNotificationService } from "@/lib/medicationNotifications";
import { useMedications } from "@/hooks/useMedications";
import { format } from "date-fns";
import BrowserInstructions from "@/components/BrowserInstructions";

const NotificationSettings = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const { medications } = useMedications();

  useEffect(() => {
    setPermissionStatus(Notification.permission);
  }, []);

  const requestPermission = async () => {
    const wasAlreadyDenied = Notification.permission === "denied";
    const granted = await medicationNotificationService.requestNotificationPermission();
    const newStatus = Notification.permission;
    setPermissionStatus(newStatus);
    
    if (granted) {
      toast.success("✅ Notification permission granted!");
    } else if (wasAlreadyDenied) {
      toast.error(`❌ Notifications were previously blocked. Please enable them in ${medicationNotificationService.getBrowserName()} settings.`);
    } else if (newStatus === "denied") {
      toast.error("❌ You clicked 'Block'. Please try again and click 'Allow' to enable notifications.");
    } else {
      toast.error("❌ Unable to enable notifications");
    }
  };

  const checkPermissionStatus = () => {
    const currentStatus = Notification.permission;
    setPermissionStatus(currentStatus);
    if (currentStatus === "granted") {
      toast.success("✅ Notifications are enabled!");
    } else if (currentStatus === "denied") {
      toast.error("❌ Notifications are still blocked");
    } else {
      toast.info("⚠️ Notifications not yet enabled");
    }
  };

  const testNotification = async () => {
    if (Notification.permission !== "granted") {
      toast.error("Please enable notifications first");
      return;
    }

    new Notification("🧪 Test Notification", {
      body: "If you see this, notifications are working correctly!",
      icon: "/placeholder.svg",
      requireInteraction: false,
    });

    toast.success("Test notification sent!");
  };

  const testAlarmSound = () => {
    medicationNotificationService.testAlarmSound();
    toast.success("🔊 Playing test alarm sound");
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const upcomingReminders: Array<{
      medication: string;
      time: string;
      nextTrigger: Date;
    }> = [];

    medications?.forEach((med: any) => {
      if (med.notification_enabled && med.reminder_times) {
        med.reminder_times.forEach((reminder: any) => {
          const [hours, minutes] = reminder.time.split(':').map(Number);
          const nextTrigger = new Date(now);
          nextTrigger.setHours(hours, minutes, 0, 0);
          
          if (nextTrigger < now) {
            nextTrigger.setDate(nextTrigger.getDate() + 1);
          }

          upcomingReminders.push({
            medication: med.medication_name,
            time: reminder.time,
            nextTrigger,
          });
        });
      }
    });

    return upcomingReminders.sort((a, b) => a.nextTrigger.getTime() - b.nextTrigger.getTime());
  };

  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notification Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Test and configure your medication reminders
        </p>
      </div>

      <div className="grid gap-4">
        {/* Permission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {permissionStatus === "granted" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Notification Permission
            </CardTitle>
            <CardDescription>
              Browser notification permission status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Status:</p>
                <Badge
                  variant={
                    permissionStatus === "granted"
                      ? "default"
                      : permissionStatus === "denied"
                      ? "destructive"
                      : "secondary"
                  }
                  className="mt-1"
                >
                  {permissionStatus === "granted"
                    ? "✅ Granted"
                    : permissionStatus === "denied"
                    ? "❌ Denied"
                    : "⚠️ Not Set"}
                </Badge>
              </div>
              {permissionStatus !== "granted" && (
                <Button onClick={requestPermission}>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
              )}
            </div>

            {permissionStatus === "denied" && (
              <div className="space-y-3">
                <BrowserInstructions />
                <Button 
                  variant="outline" 
                  onClick={checkPermissionStatus}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Permission Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Notifications
            </CardTitle>
            <CardDescription>
              Test your notification and alarm settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={testNotification}
                disabled={permissionStatus !== "granted"}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
              <Button
                variant="outline"
                onClick={testAlarmSound}
                className="w-full"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Test Alarm Sound
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tip: Click anywhere on the page first to enable sound playback
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Reminders
            </CardTitle>
            <CardDescription>
              Next scheduled medication reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming reminders scheduled</p>
                <p className="text-sm mt-1">Add medications with reminder times to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.slice(0, 5).map((reminder, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{reminder.medication}</p>
                      <p className="text-sm text-muted-foreground">
                        Scheduled at {reminder.time}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {format(reminder.nextTrigger, "MMM dd, h:mm a")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check Interval:</span>
              <span className="font-medium">Every 1 minute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notification Window:</span>
              <span className="font-medium">±5 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cooldown Period:</span>
              <span className="font-medium">1 hour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Medications:</span>
              <span className="font-medium">
                {medications?.filter((m: any) => m.notification_enabled).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;
