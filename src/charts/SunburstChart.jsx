import * as d3 from "d3";

function autoBox() {
  document.body.appendChild(this);
  const { x, y, width, height } = this.getBBox();
  document.body.removeChild(this);
  return [x, y, width, height];
}

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

const SunburstChart = (data) => {
  // Specify the chart’s colors and approximate radius (it will be adjusted at the end).
  // const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

  // Specify the chart's dimensions.
  const width = 1228;
  const radius = width / 2;

  // Prepare the layout.
  const partition = (data) =>
    d3
      .partition()
      // .padding(0.005)
      .size([2 * Math.PI, radius])(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    );

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1);

  const root = partition(data);

  // Create the SVG container.
  const svg = d3.create("svg");

  // Add an arc for each element, with a title for tooltips.
  const format = d3.format(",d");
  svg
    .append("g")
    .attr("fill-opacity", 0.6)
    .selectAll("path")
    .data(root.descendants().filter((d) => d.depth))
    .join("path")
    .attr("fill", (d) => {
      while (d.depth > 1 && !d.data.color) d = d.children[0];
      return d.data.color || "#ccc";
    })
    // .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    .attr("d", arc)
    .append("title")
    .text(
      (d) =>
        `${d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join("/")}\n${format(d.value)}`
    );

  // Add a label for each element.
  svg
    .append("g")
    .attr("pointer-events", "none")
    .attr("font-size", 7)
    .attr("font-family", "sans-serif")
    .selectAll("text")
    .data(
      root
        .descendants()
        .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
    )
    .join("text")
    .attr("transform", function (d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = d.y0;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr("dy", "0.35em")
    .attr("x", (d) => {
      const angle = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      return angle < 180 ? 3 : -3; // Padding b/w start of arc and label
    })
    .attr("text-anchor", (d) => {
      const angle = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      return angle < 180 ? "start" : "end";
    })
    .text((d) => {
      const maxLength = 21; // Label truncation, adjust as needed
      return truncateText(d.data.name, maxLength);
    });

  // Add tooltips for segments with no visible text
  svg
    .selectAll("path")
    .append("title")
    .text((d) => {
      const width = (d.x1 - d.x0) * radius;
      return width <= 10 ? d.data.name : "";
    });

  // The autoBox function adjusts the SVG’s viewBox to the dimensions of its contents.
  return svg.attr("viewBox", autoBox).node();
};

export default SunburstChart;
