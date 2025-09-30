import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";

const Upcoming = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>
      <UpcomingEvents />
    </div>
  );
};

export default Upcoming;
