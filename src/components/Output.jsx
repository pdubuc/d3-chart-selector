import React, { useEffect, useRef } from "react";
import TidyTree from "../charts/TidyTree";
import RadialChart from "../charts/RadialChart";
import CirclePackChart from "../charts/CirclePackChart";
import SunburstChart from "../charts/SunburstChart";
import ForceDirectedTreeChart from "../charts/ForceTreeChart";
import data from "../data/DG-data.json";
// import circlePackingDG from "../data/circlePackingDG.json";

export default function Output({ chartType }) {
  const rootRef = useRef();

  useEffect(() => {
    if (!data || !rootRef.current) return;

    let chart = "";
    if (chartType === "Tidy Tree") {
      chart = TidyTree(data);
    } else if (chartType === "Radial Tree") {
      chart = RadialChart(data);
    } else if (chartType === "Circle Pack") {
      chart = CirclePackChart(data);
    } else if (chartType === "Sunburst") {
      chart = SunburstChart(data);
    } else if (chartType === "Force Directed Tree") {
      chart = ForceDirectedTreeChart(data);
    }
    rootRef.current.innerHTML = "";
    rootRef.current.appendChild(chart);
  }, [chartType, data, rootRef]);

  return <div ref={rootRef}></div>;
}
