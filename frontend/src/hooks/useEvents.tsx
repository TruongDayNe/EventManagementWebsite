// hooks/useEvents.ts
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance"; // Adjust the path based on your project structure

interface ApiEvent {
  eventId: string;
  eventName: string;
  categoryId: string;
  statusId: string;
  description: string;
  address: string;
  hostId: string;
  startTime: string;
  endTime: string;
  startCheckin: string;
  endCheckin: string;
  createAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    calendar: string;
    isMultiDay?: boolean;
  };
}

export const useEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiEvent[]>("/api/Events");
        const apiEvents = response.data;

        // Transform API events to CalendarEvent format
        const transformedEvents: CalendarEvent[] = apiEvents.map((apiEvent) => {
          const start = new Date(apiEvent.startTime);
          const end = new Date(apiEvent.endTime);
          const isMultiDay = start.toDateString() !== end.toDateString();

          return {
            id: apiEvent.eventId, // Use timestamp as the unique ID
            title: apiEvent.eventName,
            start: apiEvent.startTime,
            end: apiEvent.endTime,
            extendedProps: {
              calendar: "Primary", // Default to "Primary"; adjust based on categoryId or statusId if needed
              isMultiDay,
            },
          };
        });

        setEvents(transformedEvents);
        setError(null);
      } catch (err) {
        setError("Failed to fetch events. Please try again later.");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};