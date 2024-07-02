import React, { useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { VisuallyHiddenInput, HtmlTooltip } from "./ButtonStyles";

const UploadJson = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          onFileUpload(jsonData, file.name);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          onFileUpload(null, "");
        }
      };
      reader.readAsText(file);
    } else {
      setFileName("");
      onFileUpload(null, "");
    }
  };

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, mb: 1 }}>
        <HtmlTooltip title="Please select a file of type .json">
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            endIcon={<ArrowDropDownIcon />}
          >
            Select File
            <VisuallyHiddenInput
              type="file"
              accept=".json"
              onChange={handleFileChange}
            />
          </Button>
        </HtmlTooltip>
        {fileName && (
          <Typography variant="body1">
            {fileName && (
              <Typography variant="body2" component="span">
                Selected file: {fileName}
              </Typography>
            )}
          </Typography>
        )}
      </Box>
    </div>
  );
};

export default UploadJson;
