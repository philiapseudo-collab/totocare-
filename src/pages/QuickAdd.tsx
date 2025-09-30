import { QuickAddForm } from "@/components/dashboard/QuickAddForm";

const QuickAdd = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick Add</h1>
      <QuickAddForm />
    </div>
  );
};

export default QuickAdd;
