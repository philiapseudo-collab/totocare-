import { TodaysChecklist } from "@/components/dashboard/TodaysChecklist";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { QuickAddForm } from "@/components/dashboard/QuickAddForm";
import { KeyMetrics } from "@/components/dashboard/KeyMetrics";
import { ConditionsPanel } from "@/components/dashboard/ConditionsPanel";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DueDateCountdown } from "@/components/dashboard/DueDateCountdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckSquare, Plus, Calendar, AlertCircle, Activity } from "lucide-react";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const navigationButtons = [
    { title: "Journal", icon: BookOpen, path: "/journal", color: "bg-primary" },
    { title: "Today's Checklist", icon: CheckSquare, path: "/checklist", color: "bg-accent" },
    { title: "Quick Add", icon: Plus, path: "/quick-add", color: "bg-secondary" },
    { title: "Upcoming", icon: Calendar, path: "/upcoming", color: "bg-primary" },
    { title: "Conditions", icon: AlertCircle, path: "/conditions", color: "bg-accent" },
    { title: "Recent Activity", icon: Activity, path: "/recent-activity", color: "bg-secondary" },
  ];

  if (isMobile) {
    return (
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Due Date Countdown */}
        <DueDateCountdown />

        {/* Key Metrics - 3x1 Column */}
        <div className="space-y-4">
          <KeyMetrics />
        </div>

        {/* Navigation Buttons - 2x3 Grid */}
        <div className="grid grid-cols-2 gap-4">
          {navigationButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Card
                key={button.path}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(button.path)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
                  <div className={`${button.color} p-4 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-center text-sm">{button.title}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <KeyMetrics />
          <RecentActivity />
          <TodaysChecklist />
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          <QuickAddForm />
          <UpcomingEvents />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <DueDateCountdown />
          <ConditionsPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;