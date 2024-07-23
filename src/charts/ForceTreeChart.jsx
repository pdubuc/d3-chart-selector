import * as d3 from "d3";

const ForceDirectedTreeChart = (data) => {
  const width = 1054;
  const height = 1054;

  // Introduce a scaling factor (adjust as needed)
  const scaleFactor = 1.45;

  const svg = d3
    .create("svg")
    .attr("viewBox", [-width / 1.9, -height / 2, width, height]) // Adjust margins as needed
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

  // Assign node_type a value for determining the size of the circle
  function getNodeRadius(nodeType) {
    switch (nodeType) {
      case "0_area_folder":
        return 8;
      case "1_standard_node":
        return 7;
      case "1.5_value_chain":
        return 6;
      case "2_control_measure":
        return 5.5;
      case "2.5_value_link":
        return 5;
      case "3_procedure":
        return 4;
      case "4_action":
        return 3.5;
      default:
        return 3.5; // Default size for unknown node types
    }
  }

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
    // .attr("fill", (d) => (d.children ? "#555" : "#999"))
    .attr("fill", (d) => d.data.color || "#000000") // apply node colors
    // .attr("r", (d) => (d.children ? 10 : 5))
    .attr("r", (d) => getNodeRadius(d.data.node_type) * scaleFactor) // Set circle size by node type & apply scaling factor
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
  return svg.node();
};

export default ForceDirectedTreeChart;
