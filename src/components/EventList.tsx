import prisma from "@/lib/prisma";
import { Event } from "@prisma/client";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  let data: Event[] = [];
  
  try {
    const date = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    data = await prisma.event.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    data = [];
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">No events scheduled for this date</p>
      </div>
    );
  }

  return data.map((event) => (
    <div
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600">{event.title}</h1>
        <span className="text-gray-300 text-xs">
          {event.startTime.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      </div>
      <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
    </div>
  ));
};

export default EventList;
