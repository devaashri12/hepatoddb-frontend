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

function TPM() {
  const [gene, setGene] = useState("");
  const [geneOptions, setGeneOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tpmData, setTpmData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch unique disease names
  useEffect(() => {
    axios
      .get("http://localhost:4000/tpm/unique-values")
      .then((response) => setGeneOptions(response.data.gene || []))
      .catch((error) => console.error("Error fetching Gene options:", error));
  }, []);

  // Fetch data on search
  const fetchTpmData = async () => {
    if (!gene.trim()) {
      setError("Please enter a Gene name.");
      setTpmData([]); // Clear previous results
      return;
    }

    setLoading(true);
    setError(null);
    setTpmData([]); // Clear previous results before fetching new data

    try {
      const response = await axios.get(
        `http://localhost:4000/tpm?name=${encodeURIComponent(gene)}`
      );
      if (response.data.length === 0) {
        setError("No data found for the entered gene.");
      } else {
        setTpmData(response.data.data);
        // console.log(response.data);
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
            Transcripts per Million (TPM)
          </MDTypography>
        </MDBox>

        {/* Main content with flexGrow to push footer down */}
        <MDBox py={5} flexGrow={1}>
          <Card sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
            <Autocomplete
              options={geneOptions}
              freeSolo
              value={gene}
              onInputChange={(event, newValue) => setGene(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Search by Gene Name" variant="outlined" fullWidth />
              )}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={fetchTpmData}
              disabled={gene === ""}
              sx={{ mt: 2 }}
            >
              {gene ? "Search" : "Select a Gene"}
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
              tpmData.length > 0 && (
                <Grid container spacing={2} justifyContent="center" style={{ padding: "20px" }}>
                  {tpmData.map((item, index) => (
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
                            🧬 Gene Name: {item.gene_name}
                          </MDTypography>
                          <MDTypography variant="h4" color="white">
                            🆔 <strong>Gene ID:</strong> {item.gene_id}
                          </MDTypography>
                          <MDTypography variant="h4" color="white">
                            📊 <strong>Liver:</strong> {item.liver}
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

export default TPM;
