import React, { useState } from "react";
import UploadJson from "./components/UploadJson.jsx";
import parseData from "./util/parseData.js";
import ChartSelector from "./components/ChartSelector.jsx";
import Output from "./components/Output.jsx";

function App() {
  const [kbdata, setKbdata] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);

  const handleUpload = (data) => {
    setKbdata(parseData(data));
    setSelectedChart("");
  };

  const handleChartSelection = (chart) => {
    setSelectedChart(chart);
  };

  return (
    <div>
      <UploadJson onFileUpload={handleUpload} />
      {kbdata && (
        <ChartSelector
          selectedChart={selectedChart}
          onChartSelect={handleChartSelection}
        />
      )}
      {selectedChart && <Output chartType={selectedChart} data={kbdata} />}
    </div>
  );
}

export default App;
