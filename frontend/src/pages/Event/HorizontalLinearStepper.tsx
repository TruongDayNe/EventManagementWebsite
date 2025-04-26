import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Calendar from "../Calendar";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { useState, useEffect } from "react";
import MapComponent from "../../components/MapComponent";
import { LatLng } from "leaflet";
import TitlebarImageList from "../UiElements/TitlebarImageList";
import Grid from "@mui/material/Grid";
import axiosInstance from "../../api/axiosInstance";

const steps = ["Add event details", "Preview", "Set date and time"];

export default function HorizontalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [latlng, setLatLng] = useState<LatLng | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | string[]>("");
  const [eventDateTime, setEventDateTime] = useState<{
    startTime: string;
    endTime: string;
    startCheckin: string;
    endCheckin: string;
  } | null>(null);

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
    setCategory("");
    setAddress("");
    setLatLng(null);
    setResponseMessage("");
    setEventDateTime(null);
  };

  // Categories section
  interface Category {
    categoryName: string;
  }

  const getCategories = async (): Promise<{ label: string; value: string }[]> => {
    try {
      const { data } = await axiosInstance.get<Category[]>("/api/Category");
      const options = data.map((item) => ({
        label: item.categoryName,
        value: item.categoryName,
      }));
      return options;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  };

  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    getCategories().then((fetchedOptions) => {
      setOptions(fetchedOptions);
    });
  }, []);

  const handleSelectChange = (value: string) => {
    setCategory(value);
  };

  const handleEventSubmit = (eventData: {
    startTime: string;
    endTime: string;
    startCheckin: string;
    endCheckin: string;
  }) => {
    setEventDateTime(eventData);
    // Automatically proceed to the next step after selecting date and time
    handleNext();
  };

  const handleSubmit = async () => {
    if (!eventDateTime) {
      setResponseMessage(["Please set the event date and time."]);
      return;
    }
    const formData = {
      eventName: eventName,
      categoryId: category,
      status: "string", // Placeholder as per API
      description,
      address,
      hostId: "string", // Placeholder as per API
      startTime: eventDateTime.startTime,
      endTime: eventDateTime.endTime,
      startCheckin: eventDateTime.startCheckin,
      endCheckin: eventDateTime.endCheckin,
    };

    try {
      const response = await axiosInstance.post("/api/Events/Create", formData);
      setResponseMessage(response.data.message || "Event created successfully!");
    } catch (error: any) {
      if (error.response && error.response.data) {
        setResponseMessage(error.response.data.errors || ["An error occurred while creating the event."]);
      } else {
        setResponseMessage(["An unexpected error occurred."]);
      }
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
                  options={options}
                  placeholder="Select Category"
                  onChange={handleSelectChange}
                  className="dark:bg-dark-900"
                />
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
            <Calendar onEventSubmit={handleEventSubmit} />
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
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
            <Typography sx={{ mt: 2, mb: 1 }}>
              {Array.isArray(responseMessage) ? (
                responseMessage.map((msg, index) => (
                  <div key={index} style={{ color: "red" }}>
                    {msg}
                  </div>
                ))
              ) : (
                <div style={{ color: "green" }}>{responseMessage}</div>
              )}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
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
              <Button onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </Box>
    </div>
  );
}