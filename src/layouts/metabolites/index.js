import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";

function Metabolites() {
  const [disease, setDisease] = useState("");
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaboliteData, setMetaboliteData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch unique disease names
  useEffect(() => {
    axios
      .get("http://localhost:4000/metabolites/unique-values")
      .then((response) => setDiseaseOptions(response.data.disease || []))
      .catch((error) => console.error("Error fetching disease options:", error));
  }, []);

  // Fetch data on search
  const fetchMetaboliteData = async () => {
    if (!disease.trim()) {
      setError("Please enter a disease name.");
      setMetaboliteData([]); // Clear previous results
      return;
    }

    setLoading(true);
    setError(null);
    setMetaboliteData([]); // Clear previous results before fetching new data

    try {
      const response = await axios.get(
        `http://localhost:4000/metabolites?disease=${encodeURIComponent(disease)}`
      );
      if (response.data.length === 0) {
        setError("No data found for the entered disease.");
      } else {
        setMetaboliteData(response.data);
      }
    } catch (err) {
      setError("Error fetching data. Please try again.");
      console.error("API Error:", err);
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      {/* Ensuring full height layout */}
      <MDBox display="flex" flexDirection="column" minHeight="98vh">
        {/* Centered Heading */}
        <MDBox py={5} mt={4} display="flex" justifyContent="center" alignItems="center">
          <MDTypography variant="h1" color="info" textGradient>
            Metabolites
          </MDTypography>
        </MDBox>

        {/* Main content with flexGrow to push footer down */}
        <MDBox py={5} flexGrow={1}>
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
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={fetchMetaboliteData}
              disabled={disease === ""}
              sx={{ mt: 2 }}
            >
              {disease ? "Search" : "Select a Disease"}
            </Button>
          </Card>

          {/* Show Error OR Results (never both) */}
          <MDBox mt={4}>
            {error ? (
              <Grid container justifyContent="center">
                <Grid item xs={12} md={6}>
                  <MDAlert color="error" dismissible>
                    {error}
                  </MDAlert>
                </Grid>
              </Grid>
            ) : (
              metaboliteData.length > 0 && (
                <Grid container spacing={2} justifyContent="center" style={{ padding: "20px" }}>
                  {metaboliteData.map((item, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          boxShadow: 4,
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <MDBox display="flex" flexDirection="column" gap={1}>
                          <MDTypography variant="h4" color="white" fontWeight="bold">
                            🏥 Disease: {item.disease}
                          </MDTypography>
                          <MDTypography variant="h4" color="white">
                            🧬 <strong>Metabolite:</strong> {item.metabolite}
                          </MDTypography>
                          <MDTypography variant="h4" color="white">
                            💊 <strong>Associated Drug:</strong> {item.associated_drug}
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )
            )}
          </MDBox>
        </MDBox>

        {/* Footer stays at the bottom */}
        <Footer />
      </MDBox>
    </DashboardLayout>
  );
}

export default Metabolites;
