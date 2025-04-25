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

  useEffect(() => {
    axios
      .get("http://172.208.49.107:4000/tpm/unique-values")
      .then((response) => setGeneOptions(response.data.gene || []))
      .catch((error) => console.error("Error fetching Gene options:", error));
  }, []);

  const fetchTpmData = async () => {
    if (!gene.trim()) {
      setError("Please enter a Gene name.");
      setTpmData([]);
      return;
    }

    setLoading(true);
    setError(null);
    setTpmData([]);

    try {
      const response = await axios.get(
        `http://172.208.49.107:4000/tpm?name=${encodeURIComponent(gene)}`
      );
      if (response.data.length === 0) {
        setError("No data found for the entered gene.");
      } else {
        setTpmData(response.data.data);
      }
    } catch (err) {
      setError("Error fetching data. Please try again.");
      console.error("API Error:", err);
    }

    setLoading(false);
  };

  // Function to classify expression level and interpretation
  const getExpressionDetails = (value) => {
    if (value < 0.1) {
      return {
        level: "Very Low / Noise",
        interpretation: "Likely background noise, not biologically relevant.",
      };
    } else if (value >= 0.1 && value < 1) {
      return {
        level: "Low Expression",
        interpretation: "Weakly expressed, possible regulatory genes or noise.",
      };
    } else if (value >= 1 && value < 10) {
      return { level: "Moderate Expression", interpretation: "Detected, but not highly active." };
    } else if (value >= 10 && value < 100) {
      return { level: "High Expression", interpretation: "Strongly expressed in the sample." };
    } else if (value >= 100 && value < 1000) {
      return {
        level: "Very High Expression",
        interpretation: "Highly abundant, often housekeeping or essential genes.",
      };
    } else {
      return {
        level: "Extremely High Expression",
        interpretation:
          "Found in genes with very high transcription activity, such as ribosomal or metabolic genes.",
      };
    }
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
          {/* Title */}
          <MDTypography variant="h1" color="info" textGradient>
            Transcripts per Million (TPM)
          </MDTypography>

          {/* Description */}
          <MDTypography variant="subtitle2" color="text" mt={3} maxWidth="800px">
            The TPM Search Tool in HepatoDB allows users to query gene expression levels in liver
            tissues. TPM (Transcripts Per Million) is a normalized metric used in RNA-Seq analysis
            to quantify gene expression while accounting for sequencing depth and gene length.
          </MDTypography>
        </MDBox>

        <MDBox py={1} flexGrow={1}>
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

          <MDBox mt={2}>
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
                  {tpmData.map((item, index) => {
                    const { level, interpretation } = getExpressionDetails(item.liver);
                    return (
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
                            <MDTypography variant="h4" color="white">
                              🔬 <strong>Expression Level:</strong> {level}
                            </MDTypography>
                            <MDTypography variant="h4" color="white">
                              📝 <strong>Interpretation:</strong> {interpretation}
                            </MDTypography>
                          </MDBox>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )
            )}
          </MDBox>
        </MDBox>

        <Footer />
      </MDBox>
    </DashboardLayout>
  );
}

export default TPM;
