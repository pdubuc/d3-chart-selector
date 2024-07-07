import * as d3 from "d3";

const format = d3.format(",d");

const renderCircle = (data) => {
  // Specify the dimensions of the chart.
  const width = 1228;
  const height = width;
  const margin = 15; // to avoid clipping the root circle stroke

  // Function to check if a node should have a border
  function shouldHaveBorder(d) {
    return (
      !d.children && d.parent && d.data.node_type === d.parent.data.node_type
    );
  }

  // Create the pack layout.
  const pack = d3
    .pack()
    .size([width - margin * 2, height - margin * 2])
    .padding(10)
    .radius((d) => {
      const baseRadius = Math.sqrt(d.value);
      const nodeTypeMinRadius = {
        "0_role_folder": 30,
        "1_user_node": 25,
        "1.5_value_chain": 20,
        "2_best_practice": 18,
        "2.5_value_link": 15,
        "3_process": 12,
        "4_methodology": 10,
      };
      const minRadius = nodeTypeMinRadius[d.data.node_type] || baseRadius;
      const adjustedRadius = d.children ? minRadius * 1.2 : minRadius; // Increase size for parent nodes
      return Math.max(adjustedRadius, baseRadius);
      // .radius((d) => {
      //   const baseRadius = Math.sqrt(d.value);
      //   return hasOnlyOneChild(d.data) ? baseRadius + 15 : baseRadius;
    });

  // Compute the hierarchy from the JSON data; recursively sum the
  // values for each node; sort the tree by descending value; lastly
  // apply the pack layout.
  const root = pack(
    d3
      .hierarchy(data)
      .sum((d) => d.value) // Calculates the total value of the parent node.
      .sort((a, b) => b.value - a.value)
  );

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-margin, -margin, width, height])
    .attr("style", "width: 100%; height: auto;")
    .attr("text-anchor", "middle");

  // Place each node according to the layout’s x and y values.
  const node = svg
    .append("g")
    .selectAll()
    .data(root.descendants())
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  // Display a tooltip for each node.
  node.append("title").text(
    (d) =>
      `${d
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join("/")}\n${format(d.value)}` // removed node value to give more space to display node name
  );

  // Add a filled or stroked circle.
  node
    .append("circle")
    .attr("fill", (d) => d.data.color || "#000000") // Use the color from the data.
    .attr("stroke", (d) => {
      if (d.children) return "#bbb";
      if (shouldHaveBorder(d)) return "#bbb"; // Add border for childless nodes with same type as parent
      return null;
    })
    .attr("r", (d) => d.r);

  // Add a label to leaf nodes.
  const text = node
    .filter((d) => !d.children && d.r > 5)
    .append("text")
    .attr("clip-path", (d) => `circle(${d.r})`)
    .attr("fill", (d) => {
      // Adjust the text color logic for readability.
      if (d.data.node_type === "0_role_folder") {
        return "white";
      } else if (
        d.data.node_type === "1.5_value_chain" ||
        d.data.node_type === "4_methodology"
      ) {
        return "#EEEEEE";
      } else {
        return "black";
      }
    })
    .style("font-size", (d) => `${Math.max(6, d.r / 3)}px`); // Set font size dynamically.

  // Function to truncate text.
  const truncateText = (text, maxLength) =>
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  // Add a tspan for each CamelCase-separated word.
  text
    .selectAll()
    .data((d) => {
      const words = d.data.name.split(/(?=[A-Z][a-z])|\s+/g);
      const truncatedWords = truncateText(words.join(" "), 25).split(/\s+/g); // truncate to 25 chars.
      return truncatedWords;
    })
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
    .attr("dy", "0.6em") // Moves the text down within the circle.
    .text((d) => d);

  // // Removed this tspan of the node's value, to give more space to display the node's name.
  // text
  //   .append("tspan")
  //   .attr("x", 0)
  //   .attr(
  //     "y",
  //     (d) => `${d.data.name.split(/(?=[A-Z][a-z])|\s+/g).length / 2 + 0.35}em`
  //   )
  //   .attr("fill-opacity", 0.7)
  //   .text((d) => format(d.value));

  // // For troubleshooting node sizes.
  // console.log(root.descendants().map(d => ({
  //   name: d.data.name,
  //   value: d.value,
  //   radius: d.r,
  //   nodeType: d.data.node_type,
  //   children: d.children ? d.children.length : 0
  // })));

  return svg.node();
};

export default renderCircle;
