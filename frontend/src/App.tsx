import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
// import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import HorizontalLinearStepper from "./pages/Event/HorizontalLinearStepper";
import UserHome from "./pages/Dashboard/UserHome";
import KanbanBoard from "./pages/Event/KanbanBoard";
import LandingPage from "./pages/Dashboard/LandingPage";
import EventDetail from "./pages/Event/EventDetail";
import RequiredAuth from "./authContext/RequiredAuth";
import ViewOnlyCalendar from "./pages/ViewOnlyCalendar";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Protected Routes */}
          <Route element={<RequiredAuth allowedRoles={["Admin", "Attendant"]} />}>
            {/* Nav and Header layout */}
            <Route element={<AppLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Home />} />
              <Route path="/my-activities" element={<UserHome />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              {/* Create Event */}
              <Route path="/calendar" element={<ViewOnlyCalendar />} />

              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              
              {/* Event Routes */}
              <Route path="/event-kanban-board" element={<KanbanBoard />} />
              <Route path="/events/:eventId" element={<EventDetail />} />
            </Route>

            {/* Event creation stepper */}
            <Route path="/create-event" element={<HorizontalLinearStepper />} />
          
          </Route>

          {/* Public Routes (No nav and header layout) */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />


          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
