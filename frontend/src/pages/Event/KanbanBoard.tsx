import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { blue, green, purple } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SimpleEventCard from './SimpleEventCard';

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

type EventStatus = 'upcoming' | 'inProgress' | 'completed' | 'cancelled';

// Sample event data
const eventData: Event[] = [
  {
    id: 1,
    status: 'upcoming',
    title: 'Annual Tech Conference',
    description: 'The largest tech conference bringing together industry leaders and innovators',
    organizer: 'T',
    date: 'May 20, 2025',
    location: 'Convention Center, San Francisco',
    category: 'Technology',
  },
  {
    id: 2,
    status: 'upcoming',
    title: 'Summer Music Festival',
    description: 'Three-day outdoor music festival featuring top artists from around the world',
    organizer: 'M',
    date: 'June 15, 2025',
    location: 'Central Park, New York',
    category: 'Music',
  },
  {
    id: 3,
    status: 'inProgress',
    title: 'Startup Pitch Competition',
    description: 'Entrepreneurs showcase their innovative ideas to potential investors',
    organizer: 'S',
    date: 'April 18-22, 2025',
    location: 'Innovation Hub, Austin',
    category: 'Business',
  },
  {
    id: 4,
    status: 'inProgress',
    title: 'International Food Fair',
    description: 'Culinary event featuring cuisines from over 20 countries',
    organizer: 'F',
    date: 'April 15-25, 2025',
    location: 'Waterfront Plaza, Chicago',
    category: 'Food',
  },
  {
    id: 5,
    status: 'completed',
    title: 'Global Marketing Summit',
    description: 'Industry professionals discussing the future of digital marketing',
    organizer: 'M',
    date: 'April 1-5, 2025',
    location: 'Grand Hotel, London',
    category: 'Marketing',
  },
  {
    id: 6,
    status: 'completed',
    title: 'Winter Art Exhibition',
    description: 'Showcasing contemporary art from emerging and established artists',
    organizer: 'A',
    date: 'March 10-30, 2025',
    location: 'Modern Art Gallery, Paris',
    category: 'Art',
  },
  {
    id: 7,
    status: 'cancelled',
    title: 'Sustainable Living Expo',
    description: 'Exploring eco-friendly products and sustainable lifestyle practices',
    organizer: 'E',
    date: 'Originally May 5, 2025',
    location: 'Eco Center, Seattle',
    category: 'Environment',
  },
];

// Event interface
interface Event {
  id: number;
  status: EventStatus;
  title: string;
  description: string;
  organizer: string;
  date: string;
  location: string;
  category: string;
}

export default function EventKanbanBoard() {
  // Group events by status
  const upcomingEvents = eventData.filter((event) => event.status === 'upcoming');
  const inProgressEvents = eventData.filter((event) => event.status === 'inProgress');
  const completedEvents = eventData.filter((event) => event.status === 'completed');

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
          <Grid size={{xs:12, sm:6, md:4}}>
            <KanbanColumn elevation={2}>
              <ColumnTitle variant="h6" sx={{ backgroundColor: blue[100], color: blue[800] }}>
                UPCOMING ({upcomingEvents.length})
              </ColumnTitle>
              {upcomingEvents.map((event) => (
                <SimpleEventCard
                  id ={event.id}
                  key={event.id}
                  title={event.title}
                  date={event.date}
                  description={event.description}
                  location={event.location}
                  category={event.category}
                  organizerInitial={event.organizer}
                  status={event.status}
                  thumbnail='https://via.placeholder.com/500x300'
                />
              ))}
            </KanbanColumn>
          </Grid>

          {/* In Progress Events Column */}
          <Grid size={{xs:12, sm:6, md:4}}>
            <KanbanColumn elevation={2}>
              <ColumnTitle variant="h6" sx={{ backgroundColor: green[100], color: green[800] }}>
                IN PROGRESS ({inProgressEvents.length})
              </ColumnTitle>
              {inProgressEvents.map((event) => (
                <SimpleEventCard
                  id ={event.id}
                  key={event.id}
                  title={event.title}
                  date={event.date}
                  description={event.description}
                  location={event.location}
                  category={event.category}
                  organizerInitial={event.organizer}
                  status={event.status}
                  thumbnail='https://via.placeholder.com/500x300'
                />
              ))}
            </KanbanColumn>
          </Grid>

          {/* Completed Events Column */}
          <Grid size={{xs:12, sm:6, md:4}}>
            <KanbanColumn elevation={2}>
              <ColumnTitle variant="h6" sx={{ backgroundColor: purple[100], color: purple[800] }}>
                COMPLETED ({completedEvents.length})
              </ColumnTitle>
              {completedEvents.map((event) => (
                <SimpleEventCard
                  id ={event.id}
                  key={event.id}
                  title={event.title}
                  date={event.date}
                  description={event.description}
                  location={event.location}
                  category={event.category}
                  organizerInitial={event.organizer}
                  status={event.status}
                  thumbnail='https://via.placeholder.com/500x300'
                />
              ))}
            </KanbanColumn>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
