import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import PropTypes from "prop-types";

function Dataset() {
  // Static Columns
  const [columns] = useState([
    { Header: "Disease", accessor: "disease", align: "left" },
    { Header: "Disease ID", accessor: "disease_id", align: "left" },
    { Header: "Gene ID", accessor: "gene_id", align: "left" },
    { Header: "Gene Name", accessor: "gene_name", align: "left" },
    { Header: "Protein Name", accessor: "protein_name", align: "left" },
    {
      Header: "Pathway",
      accessor: "pathway",
      align: "left",
      Cell: ({ cell }) => {
        const value = cell?.value;
        return value && value !== "null" ? (
          <a
            href={`https://www.kegg.jp/kegg-bin/show_pathway?${value}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007bff", textDecoration: "none", fontWeight: "bold" }}
          >
            {value}
          </a>
        ) : (
          "null"
        );
      },
    },
  ]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    let allRows = [];
    let page = 1;
    let totalPages = 1;

    setLoading(true);
    try {
      do {
        const response = await axios.get(
          `http://172.208.49.107:4000/disease?page=${page}&limit=10`
        );
        console.log(`API Response (Page ${page}):`, response.data.data);
        const newRows = response.data.data.map((item) => ({
          disease: item.disease || "null",
          disease_id: item.disease_id || "null",
          gene_id: item.gene_id || "null",
          gene_name: item.gene_name || "null",
          protein_name: item.protein_name || "null",
          pathway: item.pathway || "null",
        }));

        allRows = [...allRows, ...newRows];
        totalPages = response.data.totalPages;
        page++;
      } while (page <= totalPages);

      setRows(allRows);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      {/* Full page layout with flexbox */}
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
            Dataset
          </MDTypography>
          <MDTypography variant="subtitle2" color="text" mt={3} maxWidth="1000px">
            A multi-omics database for hepatic diseases integrates various omics data (genomics,
            transcriptomics, proteomics, metabolomics, and epigenomics) to study liver diseases.
            These databases help identify disease biomarkers, genetic mutations, and metabolic
            pathways associated with liver conditions, improving diagnosis, treatment, and drug
            discovery.
          </MDTypography>
        </MDBox>
        <MDBox py={2} flexGrow={1}>
          <MDBox>
            <Card>
              <MDBox style={{ maxHeight: "auto", overflowY: "auto" }}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={true}
                  showTotalEntries={true}
                  noEndBorder={false}
                  canSearch={true}
                  pagination={true}
                />
                {loading && (
                  <MDTypography variant="caption" color="white">
                    Loading all data...
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </MDBox>
        </MDBox>

        {/* Footer stays at the bottom */}
        <Footer />
      </MDBox>
    </DashboardLayout>
  );
}

Dataset.propTypes = {
  cell: PropTypes.shape({
    value: PropTypes.string,
  }),
};

export default Dataset;
