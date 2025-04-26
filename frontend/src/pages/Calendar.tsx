import { useState, useRef, useEffect } from "react"; // Add useEffect to imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Radio from "../components/form/input/Radio";
import { TimeIcon } from "../../src/icons/index";
import { useEvents } from "../hooks/useEvents";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    isMultiDay?: boolean;
  };
}

interface CalendarProps {
  onEventSubmit?: (eventData: {
    startTime: string;
    endTime: string;
    startCheckin: string;
    endCheckin: string;
  }) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onEventSubmit }) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [isMultiDay, setIsMultiDay] = useState<string>("singleDay");
  const [validationError, setValidationError] = useState<string>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch events using the custom hook
  const { events: fetchedEvents, loading, error } = useEvents();

  // Update local events state when fetched events change
  useEffect(() => {
    if (!loading && !error) {
      setEvents(fetchedEvents);
    }
  }, [fetchedEvents, loading, error]); // Corrected to useEffect

  const formatDateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDDMMYYYYToISO = (dateStr: string): string => {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return "";
    const [day, month, year] = dateStr.split("/").map(Number);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const formatDateTimeForInput = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return { date: "", time: "" };
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return {
      date: formatDateToDDMMYYYY(date),
      time: date.toTimeString().substring(0, 5),
    };
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    const startDateTime = formatDateTimeForInput(selectInfo.start);
    const endDateTime = formatDateTimeForInput(selectInfo.end);
    setEventStartDate(startDateTime.date);
    setEventStartTime(startDateTime.time);
    const adjustedEndDate = new Date(selectInfo.end);
    adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);
    setEventEndDate(formatDateToDDMMYYYY(adjustedEndDate));
    setEventEndTime(endDateTime.time);
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);
    if (start.toDateString() !== end.toDateString()) {
      setIsMultiDay("multiDay");
    } else {
      setIsMultiDay("singleDay");
    }
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    const startDateTime = formatDateTimeForInput(event.start);
    const endDateTime = formatDateTimeForInput(
      event.end ? new Date(event.end.getTime() - 86400000) : event.start
    );
    setEventStartDate(startDateTime.date);
    setEventStartTime(startDateTime.time);
    setEventEndDate(endDateTime.date);
    setEventEndTime(endDateTime.time);
    setIsMultiDay(event.extendedProps.isMultiDay ? "multiDay" : "singleDay");
    openModal();
  };

  const handleMultiDayChange = (value: string) => {
    setIsMultiDay(value);
    if (value === "singleDay") {
      setEventEndDate(eventStartDate);
      setEventEndTime(eventStartTime);
    }
  };

  const handleDateInputChange = (value: string, setter: (value: string) => void) => {
    if (value.match(/^\d{0,2}(\/\d{0,2}(\/\d{0,4})?)?$/)) {
      setter(value);
    }
  };

  const validateDatesAndTimes = () => {
    setValidationError("");
    const startISO = parseDDMMYYYYToISO(eventStartDate);
    const endISO = parseDDMMYYYYToISO(eventEndDate || eventStartDate);
    if (!startISO) {
      setValidationError("Invalid start date format");
      return false;
    }
    if (isMultiDay === "multiDay" && !endISO) {
      setValidationError("Invalid end date format");
      return false;
    }
    const startDate = new Date(`${startISO}T${eventStartTime || "00:00"}`);
    let endDate;
    if (isMultiDay === "multiDay") {
      endDate = new Date(`${endISO}T${eventEndTime || eventStartTime || "00:00"}`);
      const startDateOnly = new Date(startISO);
      const endDateOnly = new Date(endISO);
      if (endDateOnly < startDateOnly) {
        setValidationError("End date must be on or after start date");
        return false;
      }
    } else {
      endDate = eventEndTime
        ? new Date(`${startISO}T${eventEndTime}`)
        : new Date(startDate.getTime() + 3600000);
      if (startISO !== endISO) {
        setValidationError("Single-day events must have the same start and end date");
        return false;
      }
      if (eventEndTime && eventEndTime <= eventStartTime) {
        setValidationError("End time must be after start time for single-day events");
        return false;
      }
    }
    return true;
  };

  const handleAddOrUpdateEvent = () => {
    if (!validateDatesAndTimes()) {
      return;
    }
    const startISO = parseDDMMYYYYToISO(eventStartDate);
    const endISO = parseDDMMYYYYToISO(eventEndDate || eventStartDate);
    const startDateTime = new Date(`${startISO}T${eventStartTime || "00:00"}`);
    let endDateTime;
    if (isMultiDay === "multiDay") {
      endDateTime = new Date(`${endISO}T${eventEndTime || eventStartTime || "00:00"}`);
      endDateTime.setDate(endDateTime.getDate() + 1);
    } else {
      endDateTime = eventEndTime
        ? new Date(`${startISO}T${eventEndTime}`)
        : new Date(startDateTime.getTime() + 3600000);
    }
    if (onEventSubmit) {
      const eventData = {
        startTime: startDateTime.toISOString(),
        endTime: isMultiDay === "multiDay" ? endDateTime.toISOString() : startDateTime.toISOString(),
        startCheckin: startDateTime.toISOString(),
        endCheckin: endDateTime.toISOString(),
      };
      onEventSubmit(eventData);
      closeModal();
      resetModalFields();
    } else {
      if (selectedEvent) {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? {
                  ...event,
                  start: startDateTime.toISOString(),
                  end: endDateTime.toISOString(),
                  extendedProps: {
                    calendar: event.extendedProps.calendar,
                    isMultiDay: isMultiDay === "multiDay",
                  },
                }
              : event
          )
        );
      } else {
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: "New Event",
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          allDay: !eventStartTime && !eventEndTime,
          extendedProps: {
            calendar: "Primary",
            isMultiDay: isMultiDay === "multiDay",
          },
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }
      closeModal();
      resetModalFields();
    }
  };

  const resetModalFields = () => {
    setEventStartDate("");
    setEventStartTime("");
    setEventEndDate("");
    setEventEndTime("");
    setIsMultiDay("singleDay");
    setValidationError("");
    setSelectedEvent(null);
  };

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
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
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
                left: "prev,next addEventButton",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              customButtons={{
                addEventButton: {
                  text: "Add Event +",
                  click: openModal,
                },
              }}
            />
          </div>
        )}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Event" : "Add Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment: schedule or edit an event to stay on track
              </p>
            </div>
            <div className="mt-8">
              <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Type
                </label>
                <div className="flex flex-wrap items-center gap-6">
                  <Radio
                    id="singleDay"
                    name="eventType"
                    value="singleDay"
                    checked={isMultiDay === "singleDay"}
                    onChange={handleMultiDayChange}
                    label="Single Day"
                  />
                  <Radio
                    id="multiDay"
                    name="eventType"
                    value="multiDay"
                    checked={isMultiDay === "multiDay"}
                    onChange={handleMultiDayChange}
                    label="Multiple Days"
                  />
                </div>
              </div>
              {isMultiDay === "singleDay" ? (
                <div className="mt-6">
                  <div className="mb-6">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        id="event-date"
                        type="text"
                        value={eventStartDate}
                        onChange={(e) => handleDateInputChange(e.target.value, setEventStartDate)}
                        placeholder="DD/MM/YYYY"
                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <TimeIcon className="size-6" />
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <TimeIcon className="size-6" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          id="event-start-date"
                          type="text"
                          value={eventStartDate}
                          onChange={(e) => handleDateInputChange(e.target.value, setEventStartDate)}
                          placeholder="DD/MM/YYYY"
                          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <TimeIcon className="size-6" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          id="event-end-date"
                          type="text"
                          value={eventEndDate}
                          onChange={(e) => handleDateInputChange(e.target.value, setEventEndDate)}
                          placeholder="DD/MM/YYYY"
                          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <TimeIcon className="size-6" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {validationError && (
                <div className="mt-3 text-sm font-medium text-red-500">{validationError}</div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Calendar;