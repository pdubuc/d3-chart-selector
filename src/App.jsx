import React, { useState } from "react";
import ChartSelector from "./components/ChartSelector.jsx";
import Output from "./components/Output.jsx";

function App() {
  const [selectedChart, setSelectedChart] = useState(null);

  const handleChartSelection = (chart) => {
    setSelectedChart(chart);
  };

  return (
    <div>
      <ChartSelector
        selectedChart={selectedChart}
        onChartSelect={handleChartSelection}
      />

      {selectedChart && <Output chartType={selectedChart} />}
    </div>
  );
}

export default App;
