import { TodaysChecklist } from "@/components/dashboard/TodaysChecklist";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { QuickAddForm } from "@/components/dashboard/QuickAddForm";
import { KeyMetrics } from "@/components/dashboard/KeyMetrics";
import { ConditionsPanel } from "@/components/dashboard/ConditionsPanel";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DueDateCountdown } from "@/components/dashboard/DueDateCountdown";

const Dashboard = () => {
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