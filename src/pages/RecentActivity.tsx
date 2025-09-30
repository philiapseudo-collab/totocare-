import { RecentActivity } from "@/components/dashboard/RecentActivity";

const RecentActivityPage = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Recent Activity</h1>
      <RecentActivity />
    </div>
  );
};

export default RecentActivityPage;
