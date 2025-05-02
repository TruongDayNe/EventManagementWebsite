import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance"; // Adjust the path based on your project structure

interface Image {
    url: string;
    isThumbnail: boolean;
}

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

interface EventDetails {
    eventId: string;
    eventName: string;
    categoryName: string;
    statusName: string;
    description: string;
    address: string;
    hostName: string;
    startTime: string;
    endTime: string;
    startCheckin: string;
    endCheckin: string;
    createAt: string;
    images: Image[]; // Add images array to store event images
}

interface EventImageResponse {
    imageKey: string;
    eventId: string;
    isThumbnail: boolean;
}

export const useEventDetails = () => {
    const [events, setEvents] = useState<EventDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get<ApiEvent[]>("/api/Events");
                const apiEvents = response.data;

                // Transform API events to EventDetails format
                const transformedEvents: EventDetails[] = [];
                
                for (var i in apiEvents) {
                    const apiEvent = apiEvents[i];
                    
                    try {
                        // Fetch category name
                        const categoryResponse = await axiosInstance.get<{ categoryName: string }>(
                            `/api/Categories/${apiEvent.categoryId}`
                        );
                        const categoryName = categoryResponse.data.categoryName || "Unknown Category";

                        // Fetch status name
                        const statusResponse = await axiosInstance.get<{ statusName: string }>(
                            `/api/Statuses/${apiEvent.statusId}`
                        );
                        const statusName = statusResponse.data.statusName || "Unknown Status";

                        // Fetch host name
                        const hostResponse = await axiosInstance.get<{ userName: string }>(
                            `/api/Users/${apiEvent.hostId}`
                        );
                        const hostName = hostResponse.data.userName || "Unknown Host";

                        // Fetch event images using the first endpoint
                        const imagesResponse = await axiosInstance.get<EventImageResponse[]>(
                            `/api/EventImages/${apiEvent.eventId}`
                        );
                        const eventImages = imagesResponse.data;

                        // Fetch presigned URLs for each image using the second endpoint
                        const images: Image[] = [];
                        
                        for (let j = 0; j < eventImages.length; j++) {
                            const eventImage = eventImages[j];
                            
                            try {
                                const presignedResponse = await axiosInstance.get<string>(
                                    `/api/Image/${eventImage.imageKey}/presigned`
                                );
                                
                                const image: Image = {
                                    url: presignedResponse.data, // The presigned URL
                                    isThumbnail: eventImage.isThumbnail,
                                };
                                
                                images.push(image);
                            } catch (err) {
                                console.error(`Error fetching presigned URL for image ${eventImage.imageKey}:`, err);
                                
                                const fallbackImage: Image = {
                                    url: "", // Fallback empty URL
                                    isThumbnail: eventImage.isThumbnail,
                                };
                                
                                images.push(fallbackImage);
                            }
                        }

                        const eventDetail: EventDetails = {
                            eventId: apiEvent.eventId,
                            eventName: apiEvent.eventName,
                            categoryName,
                            statusName,
                            description: apiEvent.description,
                            address: apiEvent.address,
                            hostName,
                            startTime: apiEvent.startTime,
                            endTime: apiEvent.endTime,
                            startCheckin: apiEvent.startCheckin,
                            endCheckin: apiEvent.endCheckin,
                            createAt: apiEvent.createAt,
                            images, // Add the fetched images
                        };
                        
                        transformedEvents.push(eventDetail);
                    } catch (err) {
                        console.error(`Error fetching details for event ${apiEvent.eventId}:`, err);
                        
                        // Fallback values in case of individual fetch failure
                        const fallbackEventDetail: EventDetails = {
                            eventId: apiEvent.eventId,
                            eventName: apiEvent.eventName,
                            categoryName: "Unknown Category",
                            statusName: "Unknown Status",
                            description: apiEvent.description,
                            address: apiEvent.address,
                            hostName: "Unknown Host",
                            startTime: apiEvent.startTime,
                            endTime: apiEvent.endTime,
                            startCheckin: apiEvent.startCheckin,
                            endCheckin: apiEvent.endCheckin,
                            createAt: apiEvent.createAt,
                            images: [], // Fallback empty images array
                        };
                        
                        transformedEvents.push(fallbackEventDetail);
                    }
                }

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