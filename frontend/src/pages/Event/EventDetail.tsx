import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShareIcon from '@mui/icons-material/Share';
// import FavoriteIcon from '@mui/icons-material/Favorite';
import { LatLng } from 'leaflet';
import SimpleEventCard from './SimpleEventCard';
import MapComponent from '../../components/MapComponent';

// Sample event data
const eventDetail = {
  id: 1,
  title: 'Sound of Christmas',
  date: 'December 24, 2024 | 7:00 PM - 10:00 PM',
  location: 'Christmas Concert Hall, 123 Festival Street, New York',
  coordinates: new LatLng(16.0748, 108.152),
  description: `Join us for a magical evening of Christmas music and celebration. Experience the joy of the season with traditional carols and contemporary holiday favorites performed by our renowned orchestra.

This year's Sound of Christmas concert promises to be an unforgettable celebration featuring:
- Live orchestra performance
- Special guest vocalists
- Interactive carol singing
- Festive atmosphere and decorations

Don't miss this opportunity to create wonderful Christmas memories with your loved ones.`,
  organizer: {
    name: 'High Street Living',
    avatar: '/images/brand/organizer-logo.png',
  },
  tags: ['Christmas', 'Music', 'Concert', 'Holiday', 'Family'],
  imageUrl: '/images/event-banner.jpg',
};

// Similar events data
const similarEvents = [
  {
    id: 1,
    title: 'Winter Wonderland Festival',
    description: 'A magical winter festival with ice skating, holiday markets, and live performances.',
    date: 'December 20, 2024',
    location: 'Central Park, New York',
    category: 'Festival',
    organizerInitial: 'W',
    status: 'upcoming' as const,
    thumbnail: '/images/event-thumbnail.jpg',
  },
  {
    id: 2,
    title: 'New Year\'s Eve Gala',
    description: 'Ring in the new year with an elegant evening of dining, dancing, and celebration.',
    date: 'December 31, 2024',
    location: 'Grand Plaza Hotel',
    category: 'Gala',
    organizerInitial: 'N',
    status: 'upcoming' as const,
    thumbnail: '/images/event-thumbnail.jpg',
  },
  {
    id: 3,
    title: 'Holiday Light Show',
    description: 'Experience the magic of thousands of twinkling lights synchronized to holiday music.',
    date: 'December 15-30, 2024',
    location: 'Botanical Gardens',
    category: 'Entertainment',
    organizerInitial: 'H',
    status: 'upcoming' as const,
    thumbnail: '/images/event-thumbnail.jpg',
  },
];

const EventDetail: React.FC = () => {

  const handleShare = React.useCallback(() => {
    console.log('Share clicked');
  }, []);

  // const handleFavorite = React.useCallback(() => {
  //   console.log('Favorite clicked');
  // }, []);

  const handleRegister = React.useCallback(() => {
    console.log('Register clicked');
  }, []);

  const handleLatLngChange = React.useCallback((latlng: LatLng) => {
    console.log('Map clicked at:', latlng);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Event Header */}
      <Paper
        sx={{
          position: 'relative',
          mb: 4,
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <Box
          component="img"
          src={eventDetail.imageUrl}
          alt={eventDetail.title}
          sx={{
            width: '100%',
            height: 300,
            objectFit: 'cover',
          }}
        />
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{xs:12, md:8}}>
              <Typography variant="h4" component="h1" gutterBottom>
                {eventDetail.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {eventDetail.date}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {eventDetail.location}
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{xs:12, md:4}} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleRegister}
                sx={{ mb: 2, width: { xs: '100%', md: 'auto' } }}
              >
                Register Now
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton color="primary" onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
                {/* <IconButton color="primary" onClick={handleFavorite}>
                  <FavoriteIcon />
                </IconButton> */}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Event Details */}
        <Grid size={{xs:12, md:8}}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {eventDetail.description}
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
                  {eventDetail.location}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: '100%' }}> {/* Adjusted height */}
                <MapComponent
                  onLatLngChange={handleLatLngChange}
                  canPin={false}
                  initialPosition={eventDetail.coordinates}
                />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {eventDetail.tags.map((tag) => (
                <Chip key={tag} label={tag} />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Organizer Info */}
        <Grid size={{xs:12, md:4}}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hosted by
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={eventDetail.organizer.avatar}
                alt={eventDetail.organizer.name}
                sx={{ width: 50, height: 50 }}
              />
              <Typography variant="subtitle1">
                {eventDetail.organizer.name}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Similar Events Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Other events you may like
        </Typography>
        <Grid container spacing={3}>
          {similarEvents.map((event) => (
            <Grid size={{xs:12, sm:6, md:4}} key={event.id}>
              <SimpleEventCard {...event} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default EventDetail;
