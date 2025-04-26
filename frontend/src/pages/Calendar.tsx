import { useState, useRef, useEffect } from "react";
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

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    isMultiDay?: boolean;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [isMultiDay, setIsMultiDay] = useState<string>("singleDay");
  const [validationError, setValidationError] = useState<string>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  useEffect(() => {
    // Initialize with some events
    setEvents([
      {
        id: "1",
        title: "Event Conf.",
        start: new Date().toISOString(),
        extendedProps: { calendar: "Danger", isMultiDay: false },
      },
      {
        id: "2",
        title: "Meeting",
        start: new Date(Date.now() + 86400000).toISOString(),
        extendedProps: { calendar: "Success", isMultiDay: false },
      },
      {
        id: "3",
        title: "Workshop",
        start: new Date(Date.now() + 172800000).toISOString(),
        end: new Date(Date.now() + 259200000 + 86400000).toISOString(), // Adjusted end date
        extendedProps: { calendar: "Primary", isMultiDay: true },
      },
    ]);
  }, []);

  // Convert ISO date to DD/MM/YYYY format
  const formatDateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY to ISO date (YYYY-MM-DD)
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
      time: date.toTimeString().substring(0, 5) // Extract HH:MM format
    };
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    
    const startDateTime = formatDateTimeForInput(selectInfo.start);
    const endDateTime = formatDateTimeForInput(selectInfo.end);
    
    setEventStartDate(startDateTime.date);
    setEventStartTime(startDateTime.time);
    // Adjust end date to be inclusive
    const adjustedEndDate = new Date(selectInfo.end);
    adjustedEndDate.setDate(adjustedEndDate.getDate() - 1); // Subtract one day to show correct end date
    setEventEndDate(formatDateToDDMMYYYY(adjustedEndDate));
    setEventEndTime(endDateTime.time);
    
    // Check if it's a multiple day selection
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
    setEventTitle(event.title);
    
    const startDateTime = formatDateTimeForInput(event.start);
    const endDateTime = formatDateTimeForInput(event.end ? new Date(event.end.getTime() - 86400000) : event.start); // Adjust end date for display
    
    setEventStartDate(startDateTime.date);
    setEventStartTime(startDateTime.time);
    setEventEndDate(endDateTime.date);
    setEventEndTime(endDateTime.time);
    setEventLevel(event.extendedProps.calendar);
    
    // Set multi-day radio button based on event data
    setIsMultiDay(event.extendedProps.isMultiDay ? "multiDay" : "singleDay");
    
    openModal();
  };

  const handleMultiDayChange = (value: string) => {
    setIsMultiDay(value);
    
    // If switching to single day, set end date to start date
    if (value === "singleDay") {
      setEventEndDate(eventStartDate);
      setEventEndTime(eventStartTime);
    }
  };

  // Handle DD/MM/YYYY input
  const handleDateInputChange = (value: string, setter: (value: string) => void) => {
    // Allow partial input and validate format
    if (value.match(/^\d{0,2}(\/\d{0,2}(\/\d{0,4})?)?$/)) {
      setter(value);
    }
  };

  const validateDatesAndTimes = () => {
    setValidationError("");
    
    // Parse dates from DD/MM/YYYY to Date objects
    const startISO = parseDDMMYYYYToISO(eventStartDate);
    const endISO = parseDDMMYYYYToISO(eventEndDate || eventStartDate);
    
    if (!startISO) {
      setValidationError("Invalid start date format");
      return false;
    }
    
    const startDate = new Date(`${startISO}T${eventStartTime || '00:00'}`);
    let endDate;
    
    if (isMultiDay === "multiDay") {
      if (!endISO) {
        setValidationError("Invalid end date format");
        return false;
      }
      endDate = new Date(`${endISO}T${eventEndTime || eventStartTime || '00:00'}`);
    } else {
      if (eventEndTime) {
        endDate = new Date(`${startISO}T${eventEndTime}`);
      } else {
        endDate = new Date(startDate.getTime() + 3600000); // 1 hour later
      }
    }
    
    // Validate dates
    if (endDate < startDate) {
      setValidationError("End time must be after start time");
      return false;
    }
    
    return true;
  };

  const handleAddOrUpdateEvent = () => {
    if (!validateDatesAndTimes()) {
      return;
    }
    
    // Convert DD/MM/YYYY to ISO format
    const startISO = parseDDMMYYYYToISO(eventStartDate);
    const endISO = parseDDMMYYYYToISO(eventEndDate || eventStartDate);
    
    // Combine date and time
    const startDateTime = new Date(`${startISO}T${eventStartTime || '00:00'}`);
    let endDateTime;
    
    if (isMultiDay === "multiDay") {
      endDateTime = new Date(`${endISO}T${eventEndTime || eventStartTime || '00:00'}`);
      // Add one day to end date to make it inclusive for FullCalendar
      endDateTime.setDate(endDateTime.getDate() + 1);
    } else {
      endDateTime = eventEndTime 
        ? new Date(`${startISO}T${eventEndTime}`) 
        : new Date(startDateTime.getTime() + 3600000); // Default to 1 hour later
    }
    
    if (selectedEvent) {
      // Update existing event
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                extendedProps: { 
                  calendar: eventLevel,
                  isMultiDay: isMultiDay === "multiDay" 
                },
              }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        allDay: !eventStartTime && !eventEndTime,
        extendedProps: { 
          calendar: eventLevel || "Primary",
          isMultiDay: isMultiDay === "multiDay" 
        },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventStartTime("");
    setEventEndDate("");
    setEventEndTime("");
    setEventLevel("");
    setIsMultiDay("singleDay"); 
    setValidationError("");
    setSelectedEvent(null);
  };

  const renderEventContent = (eventInfo: any) => {  
    const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
    const isMultiDay = eventInfo.event.extendedProps.isMultiDay;
    
    // Format the start and end times
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const startTime = eventInfo.event.start ? formatTime(eventInfo.event.start) : '';
    const endTime = eventInfo.event.end ? formatTime(new Date(eventInfo.event.end.getTime() - 86400000)) : '';
    
    const timeDisplay = endTime && startTime !== endTime
      ? `${startTime} - ${endTime}`
      : startTime;
  
    return (
      <div
        className={`event-fc-color flex flex-col fc-event-main ${colorClass} p-1 rounded-sm`}
      >
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
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
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
              <div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              
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
              
              <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div
                        className={`form-check form-check-${value} form-check-inline`}
                      >
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span
                                className={`h-2 w-2 rounded-full bg-white ${
                                  eventLevel === key ? "block" : "hidden"
                                }`}
                              ></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
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
                <div className="mt-3 text-sm font-medium text-red-500">
                  {validationError}
                </div>
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