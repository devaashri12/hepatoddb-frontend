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

function ProteinInteraction() {
  const [columns] = useState([
    { Header: "Protein 1", accessor: "protein1", align: "left" },
    { Header: "Protein 2", accessor: "protein2", align: "left" },
    { Header: "Score", accessor: "score", align: "left" },
    { Header: "Disease", accessor: "disease", align: "left" },
  ]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [protein1, setProtein1] = useState("");
  const [protein2, setProtein2] = useState("");
  const [disease, setDisease] = useState("");
  const [protein1Options, setProtein1Options] = useState([]);
  const [protein2Options, setProtein2Options] = useState([]);
  const [diseaseOptions, setDiseaseOptions] = useState([]);

  useEffect(() => {
    fetchFilteredData();
    fetchUniqueValues();
  }, []);

  const fetchFilteredData = async () => {
    let allRows = [];
    let page = 1;
    let totalPages = 1;
    setLoading(true);
    setNoResults(false);

    try {
      do {
        const params = {};
        if (protein1) params.protein1 = protein1;
        if (protein2) params.protein2 = protein2;
        if (disease) params.disease = disease;

        const response = await axios.get(
          `http://localhost:4000/protein-interaction?page=${page}&limit=10`,
          { params }
        );
        const newRows = response.data.data.map((item) => ({
          protein1: item.protein1 || "null",
          protein2: item.protein2 || "null",
          score: item.score || "null",
          disease: item.disease || "null",
        }));

        allRows = [...allRows, ...newRows];
        totalPages = response.data.totalPages;
        page++;
      } while (page <= totalPages);

      setRows(allRows);
      setNoResults(allRows.length === 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNoResults(true);
    }

    setLoading(false);
  };

  const fetchUniqueValues = async () => {
    try {
      const response = await axios.get("http://localhost:4000/protein-interaction/unique-values");
      setProtein1Options(response.data.protein1 || []);
      setProtein2Options(response.data.protein2 || []);
      setDiseaseOptions(response.data.disease || []);
    } catch (error) {
      console.error("Error fetching unique values:", error);
    }
  };

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
            Protein Protein Interactions
          </MDTypography>
          <MDTypography variant="subtitle2" color="text" mt={3} maxWidth="1000px">
            This page in HepatoDB provides insights into protein-protein interactions associated
            with liver diseases. Users can filter results by selecting Protein 1, Protein 2, or
            Disease, enabling targeted exploration of interaction networks. Each interaction is
            scored, indicating the confidence level of the relationship. This tool helps researchers
            understand molecular pathways, identify key regulators, and explore potential
            therapeutic targets for liver-related disorders.
          </MDTypography>
        </MDBox>
        <MDBox py={0} flexGrow={1}>
          <Card sx={{ padding: 3 }}>
            <MDBox display="flex" gap={1} mb={2}>
              <Autocomplete
                options={protein1Options}
                freeSolo
                value={protein1}
                onInputChange={(event, newValue) => setProtein1(newValue)}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField {...params} label="Protein 1" variant="outlined" fullWidth />
                )}
              />
              <Autocomplete
                options={protein2Options}
                freeSolo
                value={protein2}
                onInputChange={(event, newValue) => setProtein2(newValue)}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField {...params} label="Protein 2" variant="outlined" fullWidth />
                )}
              />
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
    </DashboardLayout>
  );
}

export default ProteinInteraction;
