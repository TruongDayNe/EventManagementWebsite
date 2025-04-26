import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import PageMeta from "../components/common/PageMeta";
import { useEvents } from "../hooks/useEvents";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    isMultiDay?: boolean;
  };
}

const ViewOnlyCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  // Fetch events using the custom hook
  const { events: fetchedEvents, loading, error } = useEvents();

  // Update local events state when fetched events change
  useEffect(() => {
    if (!loading && !error) {
      setEvents(fetchedEvents);
    }
  }, [fetchedEvents, loading, error]);

  const renderEventContent = (eventInfo: any) => {
    const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
    const formatTime = (date: Date) =>
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const startTime = eventInfo.event.start ? formatTime(eventInfo.event.start) : "";
    const endTime = eventInfo.event.end
      ? formatTime(new Date(eventInfo.event.end.getTime() - 86400000))
      : "";
    const timeDisplay =
      endTime && startTime !== endTime ? `${startTime} - ${endTime}` : startTime;
    return (
      <div className={`event-fc-color flex flex-col fc-event-main ${colorClass} p-1 rounded-sm`}>
        <div className="flex items-center">
          <div className="fc-daygrid-event-dot"></div>
          <div className="fc-event-title font-medium">{eventInfo.event.title}</div>
        </div>
        <div className="fc-event-time text-xs font-semibold pl-4 mt-0.5 text-black dark:text-white opacity-80">
          {timeDisplay}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="React.js View-Only Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js View-Only Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="p-4 text-center">Loading events...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="custom-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              selectable={false} // Disable date selection
              eventContent={renderEventContent}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ViewOnlyCalendar;