import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { blue, green, purple } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SimpleEventCard from './SimpleEventCard';
import { useEventDetails } from '../../hooks/useEventDetails'; // Adjust the path based on your project structure
import Loader from '../../components/Loader';

// Styled components
const KanbanColumn = styled(Paper)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  height: '100%',
  minHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
}));

const ColumnTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  textAlign: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}));

export default function EventKanbanBoard() {
  // Use the useEventDetails hook to fetch events
  const { events, loading, error } = useEventDetails();

  console.log(events);

  // Map the statusName to match the expected EventStatus values in the UI
  const mapStatusNameToEventStatus = (statusName: string): 'upcoming' | 'inProgress' | 'completed' | 'cancelled' => {
    switch (statusName.toLowerCase()) {
      case 'upcoming':
        return 'upcoming';
      case 'in progress':
        return 'inProgress';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'upcoming'; // Fallback to 'upcoming' if status doesn't match
    }
  };

  // Group events by status
  const upcomingEvents = events.filter((event) => mapStatusNameToEventStatus(event.statusName) === 'upcoming');
  const inProgressEvents = events.filter((event) => mapStatusNameToEventStatus(event.statusName) === 'inProgress');
  const completedEvents = events.filter((event) => mapStatusNameToEventStatus(event.statusName) === 'completed');

  // Handle loading and error states
  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Loader/>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // Hàm lấy thumbnail chính xác theo cấu trúc object
const getThumbnailUrl = (event: any): string => {
  const thumbnailObj = event.images.find((img: any) => img.isThumbnail);
  
  // Nếu thumbnailObj tồn tại, kiểm tra kiểu dữ liệu của thumbnailObj.url
  if (thumbnailObj) {
    const urlField = thumbnailObj.url;
    if (typeof urlField === 'string') {
      return urlField;
    } else if (typeof urlField === 'object' && urlField.url) {
      return urlField.url;
    }
  }

  // Nếu không có thumbnail hợp lệ
  return 'https://via.placeholder.com/500x300';
};


  return (
    <>
      <PageMeta
        title="Events | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Events KanbanBoard" />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Event Management Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Upcoming Events Column */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KanbanColumn elevation={2}>
              <ColumnTitle variant="h6" sx={{ backgroundColor: blue[100], color: blue[800] }}>
                UPCOMING ({upcomingEvents.length})
              </ColumnTitle>
              {upcomingEvents.map((event) => {
                // Find the thumbnail image, or fallback to placeholder if none exists
                const thumbnail = getThumbnailUrl(event);

                return (
                  <SimpleEventCard
                    id={event.eventId} // Convert string eventId to number for compatibility
                    key={event.eventId}
                    title={event.eventName}
                    date={event.startTime}
                    description={event.description}
                    location={event.address}
                    category={event.categoryName}
                    organizerInitial={event.hostName.charAt(0)} // Take first letter of hostName
                    status={mapStatusNameToEventStatus(event.statusName)}
                    thumbnail={thumbnail}
                  />
                );
              })}
            </KanbanColumn>
          </Grid>

          {/* In Progress Events Column */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KanbanColumn elevation={2}>
              <ColumnTitle variant="h6" sx={{ backgroundColor: green[100], color: green[800] }}>
                IN PROGRESS ({inProgressEvents.length})
              </ColumnTitle>
              {inProgressEvents.map((event) => {
                const thumbnail = event.images.find((img) => img.isThumbnail)?.url || 'https://via.placeholder.com/500x300';
                return (
                  <SimpleEventCard
                    id={event.eventId}
                    key={event.eventId}
                    title={event.eventName}
                    date={event.startTime}
                    description={event.description}
                    location={event.address}
                    category={event.categoryName}
                    organizerInitial={event.hostName.charAt(0)}
                    status={mapStatusNameToEventStatus(event.statusName)}
                    thumbnail={thumbnail}
                  />
                );
              })}
            </KanbanColumn>
          </Grid>

          {/* Completed Events Column */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KanbanColumn elevation={2}>
              <ColumnTitle variant="h6" sx={{ backgroundColor: purple[100], color: purple[800] }}>
                COMPLETED ({completedEvents.length})
              </ColumnTitle>
              {completedEvents.map((event) => {
                const thumbnail = event.images.find((img) => img.isThumbnail)?.url || 'https://via.placeholder.com/500x300';
                return (
                  <SimpleEventCard
                    id={event.eventId}
                    key={event.eventId}
                    title={event.eventName}
                    date={event.startTime}
                    description={event.description}
                    location={event.address}
                    category={event.categoryName}
                    organizerInitial={event.hostName.charAt(0)}
                    status={mapStatusNameToEventStatus(event.statusName)}
                    thumbnail={thumbnail}
                  />
                );
              })}
            </KanbanColumn>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}