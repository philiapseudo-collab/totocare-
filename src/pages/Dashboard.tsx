import { TodaysChecklist } from "@/components/dashboard/TodaysChecklist";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { QuickAddForm } from "@/components/dashboard/QuickAddForm";
import { KeyMetrics } from "@/components/dashboard/KeyMetrics";
import { ConditionsPanel } from "@/components/dashboard/ConditionsPanel";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DueDateCountdown } from "@/components/dashboard/DueDateCountdown";
import { DeliveryNotification } from "@/components/DeliveryNotification";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { HealthAnalytics } from "@/components/dashboard/HealthAnalytics";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckSquare, Plus, Calendar, AlertCircle, Activity, Pill, Heart } from "lucide-react";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const navigationButtons = [
    { title: "Journal", icon: BookOpen, path: "/journal", color: "bg-primary", emoji: "📝" },
    { title: "Medications", icon: Pill, path: "/medications", color: "bg-pink-600", emoji: "💊" },
    { title: "Checklist", icon: CheckSquare, path: "/checklist", color: "bg-green-600", emoji: "✅" },
    { title: "Donate", icon: Heart, path: "/donate", color: "bg-red-600", emoji: "❤️" },
    { title: "Add Entry", icon: Plus, path: "/quick-add", color: "bg-blue-600", emoji: "➕" },
    { title: "Coming Up", icon: Calendar, path: "/upcoming", color: "bg-purple-600", emoji: "📅" },
    { title: "Health Issues", icon: AlertCircle, path: "/conditions", color: "bg-orange-600", emoji: "🩺" },
  ];

  if (isMobile) {
    return (
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Delivery Notification */}
        <DeliveryNotification />
        
        {/* Due Date Countdown */}
        <DueDateCountdown />

        {/* Key Metrics - 3x1 Column */}
        <div className="space-y-4">
          <KeyMetrics />
        </div>

        {/* Navigation Buttons - 2x3 Grid */}
        <div className="grid grid-cols-2 gap-4">
          {navigationButtons.map((button) => {
            return (
              <Card
                key={button.path}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2"
                onClick={() => navigate(button.path)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
                  <div className="text-5xl mb-2">
                    {button.emoji}
                  </div>
                  <h3 className="font-bold text-center text-base">{button.title}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Delivery Notification - Full Width */}
      <DeliveryNotification />
      
      {/* AI Insights - Full Width */}
      <AIInsightsPanel />
      
      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <KeyMetrics />
          <HealthAnalytics />
          <RecentActivity />
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          <QuickAddForm />
          <UpcomingEvents />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <DueDateCountdown />
          
          {/* Donation Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20"
            onClick={() => navigate('/donate')}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-6xl mb-2">❤️</div>
              <h3 className="font-bold text-xl">Support Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                Help us improve maternal and infant healthcare
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                  Make a Donation <Heart className="h-4 w-4" />
                </span>
              </div>
            </CardContent>
          </Card>
          
          <ConditionsPanel />
          <TodaysChecklist />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;