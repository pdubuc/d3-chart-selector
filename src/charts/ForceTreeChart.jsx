import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const ForceDirectedTreeChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 954;
    const height = 954;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .style("font", "12px sans-serif");

    const root = d3.hierarchy(data);
    const links = root.links();
    const nodes = root.descendants();

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100)
          .strength(1)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", (d) => (d.target.children ? "#555" : "#999"))
      .attr("stroke-width", (d) => (d.target.children ? 1.5 : 1))
      .attr("marker-end", (d) => (d.target.children ? "url(#arrow)" : ""));

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("fill", (d) => (d.children ? "#555" : "#999"))
      .attr("r", (d) => (d.children ? 10 : 5))
      .call(drag(simulation));

    node.append("title").text((d) => d.data.name);

    simulation.on("tick", () => {
      link.attr(
        "d",
        (d) => `
        M${d.source.x},${d.source.y}
        C${d.source.x},${(d.source.y + d.target.y) / 2}
         ${d.target.x},${(d.source.y + d.target.y) / 2}
         ${d.target.x},${d.target.y}
      `
      );

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });

    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return <svg ref={svgRef} width="954" height="954"></svg>;
};

export default ForceDirectedTreeChart;
