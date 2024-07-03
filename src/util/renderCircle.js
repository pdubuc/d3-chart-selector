import * as d3 from "d3";

const renderCircle = (data, nodeType, colors) => {
  // Specify the dimensions of the chart.
  const width = 1228;
  const height = width;
  const margin = 15; // to avoid clipping the root circle stroke

  // Define color scale for node_type
  const nodeTypeColorScale = d3
    .scaleOrdinal()
    .domain(nodeType)
    .range(colors);

  // Specify the number format for values.
  const format = d3.format(",d");

  // Create the pack layout.
  const pack = d3
    .pack()
    .size([width - margin * 2, height - margin * 2])
    .padding(3);

  // Compute the hierarchy from the JSON data; recursively sum the
  // values for each node; sort the tree by descending value; lastly
  // apply the pack layout.
  const root = pack(
    d3
      .hierarchy(data)
      .sum((d) => d.id) // changed from value to id
      .sort((a, b) => b.id - a.id)
  ); // changed from value to id

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-margin, -margin, width, height])
    .attr("style", "width: 100%; height: auto; font: 9px sans-serif;")
    .attr("text-anchor", "middle");

  // Place each node according to the layout’s x and y values.
  const node = svg
    .append("g")
    .selectAll()
    .data(root.descendants())
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  // Add a title.
  node.append("title").text(
    (d) =>
      `${d
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join("/")}\n${format(d.value)}`
  );
  console.log(
    "d => ",
    (d) =>
      `${d
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join("/")}\n${format(d.value)}`
  );

  // Add a filled or stroked circle.
  node
    .append("circle")
    .attr("fill", (d) =>
      d.children ? "#fff" : nodeTypeColorScale(d.data.node_type)
    )
    // .attr("fill", d => d.children ? "#fff" : "#ddd") // OOTB code
    .attr("stroke", (d) => (d.children ? "#bbb" : null))
    .attr("r", (d) => d.r);

  // Add a label to leaf nodes.
  const text = node
    .filter((d) => !d.children && d.r > 10)
    .append("text")
    .attr("clip-path", (d) => `circle(${d.r})`)
    .attr("fill", (d) => d.data.node_type === "4_methodology" ? "#EEEEEE" : "black"); // Adjusted text color for this node type

  // Add a tspan for each CamelCase-separated word.
  text
    .selectAll()
    .data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
    .text((d) => d);

  // Add a tspan for the node’s value.
  text
    .append("tspan")
    .attr("x", 0)
    .attr(
      "y",
      (d) => `${d.data.name.split(/(?=[A-Z][a-z])|\s+/g).length / 2 + 0.35}em`
    )
    .attr("fill-opacity", 0.7)
    .text((d) => format(d.value));

  return svg.node();
};

export default renderCircle;
