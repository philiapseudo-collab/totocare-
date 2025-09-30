import { TodaysChecklist } from "@/components/dashboard/TodaysChecklist";

const Checklist = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Today's Checklist</h1>
      <TodaysChecklist />
    </div>
  );
};

export default Checklist;
