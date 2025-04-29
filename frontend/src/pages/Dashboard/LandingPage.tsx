import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import SimpleEventCard from '../Event/SimpleEventCard';
import { Link } from 'react-router-dom';
import { useEventDetails } from '../../hooks/useEventDetails';
import Loader from '../../components/Loader';

// Styled components
const StyledSlider = styled(Slider)(({ theme }) => ({
  '.slick-slide': {
    padding: theme.spacing(1),
  },
  '.slick-list': {
    margin: '0 -8px',
  },
  '.slick-track': {
    display: 'flex',
    '.slick-slide': {
      height: 'auto',
      '> div': {
        height: '100%',
      },
    },
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  padding: theme.spacing(15, 0),
  textAlign: 'center',
}));

// Placeholder categories (replace with API data if available)
const categories = ['Music', 'Tech', 'Food', 'Art'] as const;

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { events, loading, error } = useEventDetails();

  // Utility functions from EventDetail
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

  const mapStatusNameToEventStatus = (
    statusName: string
  ): 'upcoming' | 'inProgress' | 'completed' | 'cancelled' => {
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

  // Custom arrow components for slider
  const NextArrow: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    return (
      <IconButton
        onClick={onClick}
        sx={{
          position: 'absolute',
          right: -15,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': { bgcolor: 'background.paper' },
        }}
      >
        <ArrowForwardIcon />
      </IconButton>
    );
  };

  const PrevArrow: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    return (
      <IconButton
        onClick={onClick}
        sx={{
          position: 'absolute',
          left: -15,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': { bgcolor: 'background.paper' },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
    );
  };

  // Slider settings
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container>
          <Typography variant="h2" component="h1" gutterBottom>
            Discover Amazing Events
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Find and book the best events in your city
          </Typography>
          <Link to="/event-kanban-board">
            <Button
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Explore Events
            </Button>
          </Link>
        </Container>
      </HeroSection>

      {/* Featured Categories */}
      <Container sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Browse by Category
        </Typography>
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid size={{ xs: 6, md: 3 }} key={category}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h6">{category}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Discover Events Section */}
      <Container sx={{ my: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Discover Events
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Find the most exciting events happening near you
          </Typography>
        </Box>

        <StyledSlider {...sliderSettings}>
          {events.slice(0, 6).map((event) => {
            const thumbnail = getThumbnailUrl(event) || '/images/event-thumbnail.jpg';
            const organizerInitial = event.hostName?.charAt(0) || 'U';
            const eventDate = new Date(event.startTime);
            const formattedDate = !isNaN(eventDate.getTime())
              ? eventDate.toLocaleDateString()
              : 'Date unavailable';

            return (
              <Box key={event.eventId} sx={{ px: 1, height: '100%' }}>
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
              </Box>
            );
          })}
        </StyledSlider>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          bgcolor: 'primary.light',
          color: 'white',
          py: 8,
          mt: 8,
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Ready to Host Your Own Event?
              </Typography>
              <Typography variant="subtitle1">
                Create and manage your events with our easy-to-use platform
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Get Started
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;