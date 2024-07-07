import React, { useEffect, useRef } from "react";
import renderTree from "../util/renderTree";
import renderRadial from "../util/renderRadial";
import renderCircle from "../util/renderCircle";
// import renderSunburst from "../util/renderSunburst";

export default function Output({ chartType, data }) {
  const rootRef = useRef();

  useEffect(() => {
    if (!data || !rootRef.current) return;

    let chart = "";
    if (chartType === "Tidy Tree") {
      chart = renderTree(data);
    } else if (chartType === "Radial Tree") {
      chart = renderRadial(data);
    } else if (chartType === "Circle Pack") {
      chart = renderCircle(data);
      // } else if (chartType === "Sunburst") {
      //   chart = renderSunburst(data, nodeType, colors);
    }
    rootRef.current.innerHTML = "";
    rootRef.current.appendChild(chart);
  }, [chartType, data, rootRef]);

  return <div ref={rootRef}></div>;
}
