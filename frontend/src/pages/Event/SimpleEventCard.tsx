import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface SimpleEventCardProps {
  id: number; // Add id to props
  title: string;
  date: string;
  description: string;
  location: string;
  category: string;
  organizerInitial: string;
  status: 'upcoming' | 'inProgress' | 'completed' | 'cancelled';
  thumbnail: string;
}

const StatusColors: Record<string, string> = {
  upcoming: '#2196F3',
  inProgress: '#4CAF50',
  completed: '#9C27B0',
  cancelled: '#F44336',
};

const SimpleEventCard: React.FC<SimpleEventCardProps> = ({
  id,
  title,
  date,
  location,
  category,
  organizerInitial,
  status,
  thumbnail,
}) => {
  const navigate = useNavigate();

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation if clicking on the MoreVert icon or its button
    if (
      event.target instanceof Element && 
      (event.target.closest('[aria-label="settings"]') || 
       event.target.closest('.MuiIconButton-root'))
    ) {
      return;
    }
    navigate(`/events/${id}`);
  };

  return (
    <Card 
      sx={{ 
        width: '100%', 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.2s ease-in-out',
          boxShadow: 3,
        },
      }}
      onClick={handleCardClick}
    >
      <CardMedia
        component="img"
        height="150"
        src={thumbnail}
        alt={title}
      />
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: StatusColors[status] }} aria-label="organizer">
            {organizerInitial}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={title}
        subheader={date}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {location}
          </Typography>
        </Box>
        <Chip
          label={category}
          size="small"
          sx={{ 
            mt: 1, 
            backgroundColor: StatusColors[status], 
            color: 'white',
            mb: 2,
          }}
        />
      </CardContent>
    </Card>
  );
};

export default SimpleEventCard;
