import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import CircleIcon from "@mui/icons-material/Circle";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import MDSnackbar from "components/MDSnackbar";

function Drugs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [disease, setDisease] = useState("");
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, effect: "", severity: "" });

  useEffect(() => {
    fetchFilteredData();
    fetchUniqueValues();
  }, []);

  const handleOpenSnackbar = (effect, severity) => {
    setSnackbar({ open: true, effect, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, effect: "", severity: "" });
  };

  const fetchFilteredData = async () => {
    setLoading(true);
    setNoResults(false);

    try {
      const params = {};
      if (disease) params.disease = disease;

      const response = await axios.get("http://172.208.49.107:4000/drugs", { params });
      const newRows = response.data.data.map((item) => ({
        disease: item.disease || "null",
        drug: item.drug || "null",
        severity: (
          <CircleIcon
            sx={{
              color:
                item.severity === "Mild"
                  ? "yellow"
                  : item.severity === "Moderate"
                  ? "orange"
                  : item.severity === "Severe"
                  ? "red"
                  : "green",
              fontSize: 26, // Adjust size if needed
            }}
          />
        ),
        source: item.source || "null",
        info: (
          <IconButton onClick={() => handleOpenSnackbar(item.effect, item.severity)}>
            <InfoIcon color="white" />
          </IconButton>
        ),
      }));

      setRows(newRows);
      setNoResults(newRows.length === 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNoResults(true);
    }

    setLoading(false);
  };

  const fetchUniqueValues = async () => {
    try {
      const response = await axios.get("http://172.208.49.107:4000/drugs/unique-values");
      setDiseaseOptions(response.data.diseases || []);
    } catch (error) {
      console.error("Error fetching unique values:", error);
    }
  };

  const columns = [
    { Header: "Disease", accessor: "disease", align: "left" },
    { Header: "Drug", accessor: "drug", align: "left" },
    { Header: "Severity", accessor: "severity", align: "left" },
    { Header: "Source", accessor: "source", align: "left" },
    { Header: "More Info", accessor: "info", align: "center" },
  ];

  return (
    <DashboardLayout>
      <MDBox display="flex" flexDirection="column" minHeight="108vh">
        <MDBox
          py={5}
          mt={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <MDTypography variant="h1" color="info" textGradient>
            Drug Induced Diseases
          </MDTypography>
          {/* <MDTypography variant="subtitle2" color="text" mt={3} maxWidth="1000px">
            This tool allows users to search for liver-related diseases and retrieve information on
            the metabolite involved in the disease, which may serve as a biomarker for diagnosis or
            disease progression and Understanding metabolite changes can aid in early detection and
            personalized treatment strategies.
          </MDTypography> */}
        </MDBox>
        <MDBox py={1} flexGrow={1}>
          <Card sx={{ padding: 2 }}>
            <MDBox display="flex" gap={1} mb={2}>
              <Autocomplete
                options={diseaseOptions}
                freeSolo
                value={disease}
                onInputChange={(event, newValue) => setDisease(newValue)}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField {...params} label="Disease" variant="outlined" fullWidth />
                )}
              />
              <MDButton
                variant="contained"
                color="info"
                onClick={fetchFilteredData}
                disabled={loading}
              >
                {loading ? "Loading..." : "Filter"}
              </MDButton>
            </MDBox>
            <MDBox py={1} style={{ maxHeight: "auto", overflowY: "auto" }}>
              {loading ? (
                <MDTypography variant="caption">Loading data...</MDTypography>
              ) : noResults ? (
                <MDTypography variant="h6" color="error" align="center">
                  No results found for the given filters.
                </MDTypography>
              ) : (
                <DataTable
                  table={{ columns, rows }}
                  isSorted
                  showTotalEntries
                  noEndBorder
                  pagination
                />
              )}
            </MDBox>
          </Card>
        </MDBox>
        <Footer />
      </MDBox>

      {/* Snackbar */}
      <MDSnackbar
        color="dark"
        icon="notifications"
        title="Drug Effect Details"
        content={`Effect: ${snackbar.effect} | Severity: ${snackbar.severity}`}
        open={snackbar.open}
        close={handleCloseSnackbar}
      />
    </DashboardLayout>
  );
}

export default Drugs;
