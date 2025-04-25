import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircleIcon from "@mui/icons-material/Circle";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import MDAlert from "components/MDAlert";

function KnowledgeGraph() {
  const [disease, setDisease] = useState("");
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  // Fetch unique disease names on mount
  useEffect(() => {
    axios
      .get("http://172.208.49.107:4000/protein-interaction/unique-values")
      .then((response) => {
        setDiseaseOptions(response.data.disease || []);
      })
      .catch((error) => {
        console.error("Error fetching disease options:", error);
        setError("Failed to fetch disease options. Please try again.");
      });
  }, []);

  const fetchDiseaseImage = () => {
    if (!disease.trim()) {
      setError("Please select a valid disease name.");
      setImage(null);
      return;
    }

    // Construct the correct path for images stored in public/knowledgeGraphs
    const imagePath = `${process.env.PUBLIC_URL}/knowledgeGraphs/${disease}.png`;

    // Check if image exists before setting it
    const img = new Image();
    img.src = imagePath;
    img.onload = () => {
      setImage(imagePath);
      setError(null);
      console.log("Image found:", imagePath);
    };
    img.onerror = () => {
      setImage(null);
      setError("No image found for the selected disease.");
      console.error("Image not found:", imagePath);
    };
  };

  return (
    <DashboardLayout>
      <MDBox display="flex" flexDirection="column" minHeight="98vh">
        <MDBox
          py={5}
          mt={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <MDTypography variant="h1" color="info" textGradient>
            Knowledge Graphs
          </MDTypography>
          <MDTypography variant="h5" color="text" mt={3} maxWidth="800px">
            🟠 - Disease
          </MDTypography>
          <MDTypography variant="h5" color="text" mt={0} maxWidth="800px">
            🟣 - Gene
          </MDTypography>
        </MDBox>

        {/* Search Box */}
        <MDBox py={1} flexGrow={1}>
          <Card sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
            <Autocomplete
              options={diseaseOptions}
              freeSolo
              value={disease}
              onInputChange={(event, newValue) => setDisease(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Search Disease" variant="outlined" fullWidth />
              )}
            />
            <MDBox mt={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={fetchDiseaseImage}
                // disabled={disease === ""}
              >
                {disease ? "Search" : "Select a Disease"}
              </Button>
            </MDBox>
          </Card>
        </MDBox>

        {/* Display Image or Error */}
        <MDBox mt={2} display="flex" justifyContent="center">
          {error && (
            <MDAlert color="error" dismissible>
              {error}
            </MDAlert>
          )}
          {image && (
            <MDBox display="flex" justifyContent="center">
              <img
                src={image}
                alt={disease}
                style={{ maxWidth: "100%", height: "auto", borderRadius: "10px" }}
              />
            </MDBox>
          )}
        </MDBox>

        {/* Footer stays at the bottom */}
        <Footer />
      </MDBox>
    </DashboardLayout>
  );
}

export default KnowledgeGraph;
