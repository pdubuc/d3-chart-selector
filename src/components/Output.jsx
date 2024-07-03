import React, { useEffect, useRef } from "react";
import renderTree from "../util/renderTree";
import renderRadial from "../util/renderRadial";
import renderCircle from "../util/renderCircle";

export default function Output({ chartType, data }) {
  const rootRef = useRef();
  const nodeType = [
    "0_role_folder",
    "1_user_node",
    "2_best_practice",
    "3_process",
    "4_methodology",
  ];
  const colors = ["#4169E1", "#FFA500", "#66CDAA", "#ADD8E6", "#006400"];
  // colors = ["Royal Blue", "Orange", "MediumAquaMarine", "LightBlue", "Dark Green"];

  useEffect(() => {
    if (!data || !rootRef.current) return;

    let chart = "";
    if (chartType === "Tidy Tree") {
      chart = renderTree(data, nodeType, colors);
    } else if (chartType === "Radial Tree") {
      chart = renderRadial(data, nodeType, colors);
    } else if (chartType === "Circle Pack") {
      chart = renderCircle(data, nodeType, colors);
    }
    rootRef.current.innerHTML = "";
    rootRef.current.appendChild(chart);
  }, [chartType, data, rootRef]);

  return <div ref={rootRef}></div>;
}
