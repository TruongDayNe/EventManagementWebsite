import React, { useState } from 'react'; // Add useState for Snackbar control
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Avatar,
  Snackbar, // Import Snackbar
  Alert,   // Import Alert for styled messages
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { LatLng } from 'leaflet';
import SimpleEventCard from './SimpleEventCard';
import MapComponent from '../../components/MapComponent';
import { useEventDetails } from '../../hooks/useEventDetails';
import { useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import { useAuth } from  '../../authContext/useAuth'; 
import axiosInstance from '../../api/axiosInstance'; // Adjust the import path as necessary

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const { events, loading, error } = useEventDetails();
  const auth = useAuth();

  const userId = auth.user?.id;

  // State for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleRegister = React.useCallback(async () => {
    if (!eventId || !userId) {
      setSnackbarMessage('Missing eventId or userId');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      console.log('Sending registration request with:', { eventId, userId });

      // Assuming you have an apiRequest method in useAuth as discussed previously
      await axiosInstance.post('/api/Attendances', {
        eventId, userId
      });

      // Show success message
      setSnackbarMessage('Successfully registered for the event!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      // Show error message
      setSnackbarMessage('Error registering for the event. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error registering for the event:', error);
    }
  }, [eventId, userId, auth]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLatLngChange = React.useCallback((latlng: LatLng) => {
    console.log('Map clicked at:', latlng);
  }, []);

  const eventDetail = eventId ? events.find((event) => event.eventId === eventId) : undefined;
  const similarEvents = eventId
    ? events.filter((event) => event.eventId !== eventId).slice(0, 3)
    : [];

  const getThumbnailUrl = (event: any): string => {
    const thumbnailObj = event.images.find((img: any) => img.isThumbnail);
    if (thumbnailObj) {
      const urlField = thumbnailObj.url;
      if (typeof urlField === 'string') {
        return urlField;
      } else if (typeof urlField === 'object' && urlField.url) {
        return urlField.url;
      }
    }
    return 'https://via.placeholder.com/500x300';
  };

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
        return 'upcoming';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Loader />
      </Container>
    );
  }

  if (error || !eventId || !eventDetail) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          {error || !eventId
            ? 'Invalid event ID.'
            : `Event with ID ${eventId} not found.`}
        </Typography>
      </Container>
    );
  }

  const formatDateTime = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const isValidStart = !isNaN(start.getTime());
    const isValidEnd = !isNaN(end.getTime());
    if (!isValidStart || !isValidEnd) {
      return 'Date unavailable';
    }
    const date = start.toLocaleDateString();
    const startFormatted = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endFormatted = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} | ${startFormatted} - ${endFormatted}`;
  };

  const eventDateTime = formatDateTime(eventDetail.startTime, eventDetail.endTime);
  const thumbnail = getThumbnailUrl(eventDetail) || '/images/event-thumbnail.jpg';
  const coordinates = new LatLng(16.0748, 108.152);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Snackbar for announcements */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Paper sx={{ position: 'relative', mb: 4, overflow: 'hidden', borderRadius: 2 }}>
        <Box
          component="img"
          src={thumbnail}
          alt={eventDetail.eventName}
          sx={{ width: '100%', height: 300, objectFit: 'cover' }}
        />
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {eventDetail.eventName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {eventDateTime}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {eventDetail.address || 'Location unavailable'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleRegister}
                sx={{ mb: 2, width: { xs: '100%', md: 'auto' } }}
              >
                Register Now
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {eventDetail.description || 'No description available.'}
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {eventDetail.address || 'Location unavailable'}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: '100%' }}>
                <MapComponent
                  onLatLngChange={handleLatLngChange}
                  canPin={false}
                  initialPosition={coordinates}
                />
              </Box>
            </Box>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={eventDetail.categoryName || 'Uncategorized'} />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hosted by
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src="/images/brand/organizer-logo.png"
                alt={eventDetail.hostName || 'Unknown Host'}
                sx={{ width: 50, height: 50 }}
              />
              <Typography variant="subtitle1">
                {eventDetail.hostName || 'Unknown Host'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {similarEvents.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Other events you may like
          </Typography>
          <Grid container spacing={3}>
            {similarEvents.map((event) => {
              const thumbnail = getThumbnailUrl(event) || '/images/event-thumbnail.jpg';
              const organizerInitial = event.hostName?.charAt(0) || 'U';
              const eventDate = new Date(event.startTime);
              const formattedDate = !isNaN(eventDate.getTime())
                ? eventDate.toLocaleDateString()
                : 'Date unavailable';

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.eventId}>
                  <SimpleEventCard
                    id={event.eventId}
                    title={event.eventName}
                    description={event.description || 'No description available.'}
                    date={formattedDate}
                    location={event.address || 'Location unavailable'}
                    category={event.categoryName || 'Uncategorized'}
                    organizerInitial={organizerInitial}
                    status={mapStatusNameToEventStatus(event.statusName)}
                    thumbnail={thumbnail}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default EventDetail;