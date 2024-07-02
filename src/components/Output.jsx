import React, { useEffect, useRef } from "react";
import renderTree from "../util/renderTree";
import renderRadial from "../util/renderRadial";
import renderCircle from "../util/renderCircle";

export default function Output({ chartType, data }) {
  const rootRef = useRef();

  useEffect(() => {
    if (!data || !rootRef.current) return;

    let chart = "";
    if (chartType === "Collapsible Tree") {
      chart = renderTree(data);
    } else if (chartType === "Radial Tidy Tree") {
      chart = renderRadial(data);
    } else if (chartType === "Circle Packing") {
      chart = renderCircle(data);
    }
    rootRef.current.innerHTML = "";
    rootRef.current.appendChild(chart);
  }, [chartType, data, rootRef]);

  return <div ref={rootRef}></div>;
}
