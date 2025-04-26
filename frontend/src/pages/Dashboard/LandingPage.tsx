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
import { Link } from 'react-router';

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

// Sample event data with additional properties for SimpleEventCard
const events = [
  {
    id: 1,
    title: 'Tech Conference 2024',
    description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.',
    date: 'March 15, 2024',
    location: 'San Francisco, CA',
    category: 'Technology',
    attendees: 1500,
    organizerInitial: 'T',
    status: 'upcoming' as const,
    imageSize: '500/300',
  },
  {
    id: 2,
    title: 'Music Festival',
    description: 'Three days of non-stop music featuring top artists from around the world.',
    date: 'April 20, 2024',
    location: 'Austin, TX',
    category: 'Music',
    attendees: 5000,
    organizerInitial: 'M',
    status: 'upcoming' as const,
    imageSize: '600/400',
  },
  {
    id: 3,
    title: 'Food & Wine Expo',
    description: 'Experience culinary excellence with master chefs and sommelier-guided wine tastings.',
    date: 'May 10, 2024',
    location: 'New York, NY',
    category: 'Food',
    attendees: 2000,
    organizerInitial: 'F',
    status: 'upcoming' as const,
    imageSize: '450/250',
  },
  {
    id: 4,
    title: 'Art Exhibition',
    description: 'Showcasing contemporary art from emerging and established artists worldwide.',
    date: 'June 1, 2024',
    location: 'Chicago, IL',
    category: 'Art',
    attendees: 800,
    organizerInitial: 'A',
    status: 'upcoming' as const,
    imageSize: '500/300',
  },
];

const categories = ['Music', 'Tech', 'Food', 'Art'] as const;

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            <Grid size={{ xs:6, md:3 }} key={category}>
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
          {events.map((event) => (
            <Box key={event.id} sx={{ px: 1, height: '100%' }}>
              <SimpleEventCard
                id={event.id}
                title={event.title}
                date={event.date}
                description={event.description}
                location={event.location}
                attendees={event.attendees}
                category={event.category}
                organizerInitial={event.organizerInitial}
                status={event.status}
                imageSize={event.imageSize}
              />
            </Box>
          ))}
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
            <Grid size={{ xs: 12, md: 8 }} sx={{ textAlign: 'center' }}>
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
