import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

// ... (Giữ nguyên các interface Image, ApiEvent, EventDetails, EventImageResponse cũ của bạn)
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
    images: Image[];
}

interface EventImageResponse {
    imageKey: string;
    eventId: string;
    isThumbnail: boolean;
}

// --- Helper function để lấy chi tiết cho 1 Event ---
const fetchSingleEventDetail = async (apiEvent: ApiEvent): Promise<EventDetails> => {
    try {
        // 1. Fetch các thông tin cơ bản song song (vì số lượng ít, chỉ 3 request)
        const [categoryRes, statusRes, hostRes, imagesListRes] = await Promise.all([
            axiosInstance.get<{ categoryName: string }>(`/api/Categories/${apiEvent.categoryId}`).catch(() => ({ data: { categoryName: "Unknown Category" } })),
            axiosInstance.get<{ statusName: string }>(`/api/Statuses/${apiEvent.statusId}`).catch(() => ({ data: { statusName: "Unknown Status" } })),
            axiosInstance.get<{ userName: string }>(`/api/Users/${apiEvent.hostId}`).catch(() => ({ data: { userName: "Unknown Host" } })),
            axiosInstance.get<EventImageResponse[]>(`/api/EventImages/${apiEvent.eventId}`).catch(() => ({ data: [] })),
        ]);

        const categoryName = categoryRes.data.categoryName || "Unknown Category";
        const statusName = statusRes.data.statusName || "Unknown Status";
        const hostName = hostRes.data.userName || "Unknown Host";
        const eventImages = imagesListRes.data || [];

        // 2. Xử lý lấy Presigned URL cho hình ảnh (Có thể dùng Promise.all ở đây vì số lượng ảnh trên 1 event thường ít)
        const images: Image[] = await Promise.all(
            eventImages.map(async (eventImage) => {
                try {
                    const presignedResponse = await axiosInstance.get<string>(`/api/Image/${eventImage.imageKey}/presigned`);
                    return {
                        url: presignedResponse.data,
                        isThumbnail: eventImage.isThumbnail,
                    };
                } catch (err) {
                    console.error(`Lỗi lấy ảnh ${eventImage.imageKey}`, err);
                    return { url: "", isThumbnail: eventImage.isThumbnail };
                }
            })
        );

        return {
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
            images,
        };

    } catch (error) {
        console.error(`Error enriching event ${apiEvent.eventId}`, error);
        // Trả về dữ liệu fallback nếu lỗi nặng xảy ra
        return {
            eventId: apiEvent.eventId,
            eventName: apiEvent.eventName,
            categoryName: "Error Loading",
            statusName: "Error Loading",
            description: apiEvent.description,
            address: apiEvent.address,
            hostName: "Error Loading",
            startTime: apiEvent.startTime,
            endTime: apiEvent.endTime,
            startCheckin: apiEvent.startCheckin,
            endCheckin: apiEvent.endCheckin,
            createAt: apiEvent.createAt,
            images: [],
        };
    }
};

export const useEventDetails = () => {
    const [events, setEvents] = useState<EventDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true; // Cleanup flag để tránh set state khi component unmount

        const fetchEvents = async () => {
            try {
                setLoading(true);
                // 1. Lấy danh sách Event gốc
                const response = await axiosInstance.get<ApiEvent[]>("/api/Events");
                const apiEvents = response.data;

                if (!isMounted) return;

                const loadedEvents: EventDetails[] = [];

                // 2. Thay vì Promise.all(map...), dùng vòng lặp for...of để chạy tuần tự
                // Điều này giảm tải áp lực lên network của Docker container
                for (const apiEvent of apiEvents) {
                    if (!isMounted) break;
                    
                    // Lấy chi tiết từng event một
                    const detail = await fetchSingleEventDetail(apiEvent);
                    loadedEvents.push(detail);
                }

                if (isMounted) {
                    setEvents(loadedEvents);
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching events:", err);
                if (isMounted) setError("Failed to fetch events.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchEvents();

        return () => {
            isMounted = false;
        };
    }, []);

    return { events, loading, error };
};