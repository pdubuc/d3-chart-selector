import * as d3 from "d3";

const RadialChart = (data) => {
  // Specify the chart’s dimensions.
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Calculate the center point and radius based on the available space:
  let cx = width / 2;
  let cy = height * 0.45;

  // Introduce a scaling factor (adjust as needed)
  const scaleFactor = 1.45;
  let radius = Math.min(width, height) * 0.36 * scaleFactor; // Reduced radius

  // Create a radial tree layout. The layout’s first dimension (x)
  // is the angle, while the second (y) is the radius.
  const tree = d3
    .tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 1 : 5) / a.depth);

  // Sort the tree and apply the layout.
  const root = tree(
    d3
      .hierarchy(data)
      .sum((d) => d.value) // Calculates the total value of the parent node.
      .sort((a, b) => d3.ascending(a.data.name, b.data.name))
  );

  // Define the format function (introduced to display tooltips)
  const format = d3.format(",d");

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

  // Creates the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: auto; font: 14px sans-serif;");

  const chart = svg.append("g").attr("transform", `translate(${cx},${cy})`);

  // Append links.
  chart
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(root.links())
    .join("path")
    .attr(
      "d",
      d3
        .linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y)
    );

  // Append nodes.
  chart
    .append("g")
    .selectAll()
    .data(root.descendants())
    .join("circle")
    .attr(
      "transform",
      (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
    )
    .attr("fill", (d) => d.data.color || "#000000") // apply node colors
    .attr("r", (d) => getNodeRadius(d.data.node_type) * scaleFactor); // Set circle size by node type & apply scaling factor

  // Append labels.
  chart
    .append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll()
    .data(root.descendants())
    .join("text")
    .attr(
      "transform",
      (d) =>
        `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0) rotate(${
          d.x >= Math.PI ? 180 : 0
        })`
    )
    .attr("dy", "0.31em")

    .attr("x", (d) =>
      d.x < Math.PI ? (d.children ? -12 : 12) : d.children ? 12 : -12
    ) // space b/w bullet & label
    .attr("text-anchor", (d) =>
      d.x < Math.PI
        ? d.children
          ? "end"
          : "start"
        : d.children
        ? "start"
        : "end"
    )

    .attr("paint-order", "stroke")
    .attr("stroke", "white")
    .attr("fill", "currentColor")
    .text((d) =>
      d.data.name.length > 13
        ? d.data.name.substring(0, 13) + "..."
        : d.data.name
    ) // Adjust truncation.
    .append("title") // Display a tooltip for each node.
    .text(
      (d) =>
        `${d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join("/")}\n${format(d.value)}` // Sum of the parent node value & its children's values
      // .join("/")}\n${format(d.data.value || 0)}` // the single node's value
    );

  function updateChart() {
    width = window.innerWidth;
    height = window.innerHeight;
    cx = width / 2;
    cy = height * 0.39; // Update center point
    radius = Math.min(width, height) * 0.35 * scaleFactor; // Update radius

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    chart.attr("transform", `translate(${cx},${cy})`);

    tree.size([2 * Math.PI, radius]);

    // Re-render the chart here
    // You may need to update positions of nodes, links, and labels
  }

  window.addEventListener("resize", updateChart);
  updateChart();

  return svg.node();
};

export default RadialChart;
