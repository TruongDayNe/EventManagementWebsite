import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress"; // Import for loading indicator
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Calendar from "../Calendar";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import MapComponent from "../../components/MapComponent";
import { LatLng } from "leaflet";
import TitlebarImageList from "../UiElements/TitlebarImageList";
import Grid from "@mui/material/Grid";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../authContext/useAuth";

const steps = ["Add event details", "Preview", "Set date and time"];

interface Category {
  categoryId: string;
  categoryName: string;
}

export default function HorizontalLinearStepper() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(""); // Changed variable name to categoryId
  const [address, setAddress] = useState("");
  const [latlng, setLatLng] = useState<LatLng | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | string[]>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventDateTime, setEventDateTime] = useState<{
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const { user } = useAuth();

  const isStepOptional = (step: number) => {
    return step === 1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    setEventName("");
    setDescription("");
    setCategoryId(""); // Updated to use categoryId
    setAddress("");
    setLatLng(null);
    setResponseMessage("");
    setEventDateTime(null);
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoryError(null);
    try {
      const response = await axiosInstance.get<Category[]>("/api/Categories");
      const formattedCategories = response.data.map((item) => ({
        label: item.categoryName,
        value: item.categoryId, // Use the category ID as the value
      }));
      console.log("Fetched categories:", response.data);
      setCategories(formattedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategoryError("Failed to load categories. Please try again.");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSelectChange = (value: string) => {
    console.log("Selected category ID:", value);
    setCategoryId(value); // Set the category ID directly
  };

  // Store event date/time data temporarily without submitting
  const handleEventDateTimeSelect = (eventData: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }) => {
    setEventDateTime(eventData);
  };

  // Separated submit function
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setResponseMessage("");
    
    if (!user) {
      setResponseMessage(["You must be logged in to create an event."]);
      setIsSubmitting(false);
      return;
    }

    if (!eventDateTime) {
      setResponseMessage(["Please set the event date and time."]);
      setIsSubmitting(false);
      return;
    }

    const formData = {
      eventName,
      categoryId: categoryId, // Using categoryId directly (the ID value)
      description: description,
      address: address,
      hostId: user.id,
      startTime: eventDateTime.startDate,
      endTime: eventDateTime.endDate,
      startCheckin: eventDateTime.startTime,
      endCheckin: eventDateTime.endTime,
      latitude: latlng?.lat || null,
      longitude: latlng?.lng || null,
    };

    try {
      console.log("Form data:", formData);
      const response = await axiosInstance.post("/api/Events/Create", formData);
      setResponseMessage(response.data.message || "Event created successfully!");
      
      // Redirect to calendar page on success
      navigate('/calendar');
      
    } catch (error: any) {
      const errorMessages =
        error.response?.data?.errors ||
        [error.response?.data?.message || "An error occurred while creating the event."];
      setResponseMessage(errorMessages);
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Add event details
            </Typography>
            <ComponentCard title="Event Details" className="mb-6">
              <div>
                <Label htmlFor="inputEventName">Event name</Label>
                <Input
                  type="text"
                  id="inputEventName"
                  value={eventName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventName(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <TextArea
                  value={description}
                  onChange={(value) => setDescription(value)}
                  rows={6}
                />
              </div>
              <div>
                <Label>Event Category</Label>
                <Select
                  options={categories}
                  placeholder={loadingCategories ? "Loading categories..." : "Select Category"}
                  onChange={handleSelectChange}
                  defaultValue={categoryId} // Updated to use categoryId
                  className="dark:bg-dark-900"
                />
                {categoryError && (
                  <Typography color="error" variant="caption">
                    {categoryError}
                  </Typography>
                )}
              </div>
              <div>
                <Label htmlFor="inputAddress">Address</Label>
                <Input
                  type="text"
                  id="inputAddress"
                  placeholder="54 Nguyễn Lương Bằng / Sân khu F ĐHBK - ĐHĐN"
                  value={address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="inputPosition">Exact position</Label>
                <MapComponent onLatLngChange={setLatLng} />
                {latlng && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                    <p className="text-lg">
                      Latitude: {latlng.lat.toFixed(6)}, Longitude: {latlng.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <DropzoneComponent />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <TitlebarImageList />
                </Grid>
              </Grid>
            </ComponentCard>
          </div>
        );
      case 1:
        return <div>Step 2: Preview your event</div>;
      case 2:
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Set event date and time
            </Typography>
            <Calendar onEventSubmit={handleEventDateTimeSelect} />
            {eventDateTime && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="body1" color="success.contrastText">
                  Date and time selected successfully!
                </Typography>
                <Typography variant="body2" color="success.contrastText">
                  Start: {eventDateTime.startDate} at {eventDateTime.startTime}
                </Typography>
                <Typography variant="body2" color="success.contrastText">
                  End: {eventDateTime.endDate} at {eventDateTime.endTime}
                </Typography>
              </Box>
            )}
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Check if the user has completed all required steps
  const canFinish = activeStep === steps.length - 1 && eventDateTime !== null;

  // Show error messages
  const renderErrorMessages = () => {
    if (!responseMessage) return null;
    
    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        {Array.isArray(responseMessage) ? (
          responseMessage.map((msg, index) => (
            <Typography key={index} color="error" variant="body2">
              {msg}
            </Typography>
          ))
        ) : (
          <Typography color="success.main" variant="body2">
            {responseMessage}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <div>
      <PageMeta
        title="Create Event | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Create an event" />
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: { optional?: React.ReactNode } = {};
            if (isStepOptional(index)) {
              labelProps.optional = (
                <Typography variant="caption">Your events will look like this</Typography>
              );
            }
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <React.Fragment>
            {renderErrorMessages()}
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
            {renderErrorMessages()}
            <Box sx={{ mt: 2, mb: 1 }}>{getStepContent(activeStep)}</Box>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              {isStepOptional(activeStep) && (
                <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                  Skip
                </Button>
              )}
              
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!canFinish || isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? "Creating Event..." : "Finish"}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </React.Fragment>
        )}
      </Box>
    </div>
  );
}