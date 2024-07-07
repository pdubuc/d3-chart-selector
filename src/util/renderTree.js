import * as d3 from "d3";

const renderTree = (data) => {
  try {
    // Specify the charts' dimensions.
    let width = document.body.clientWidth;
    const marginRight = 10;
    const marginLeft = 60;

    // Create the root hierarchy
    const root = d3.hierarchy(data);

    // Define the tree layout
    const tree = d3.tree();

    // Create the SVG container
    const svg = d3
      .create("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", [0, 0, width, 0])
      .attr(
        "style",
        "max-width: 100%; height: auto; font: 16px sans-serif; user-select: none;"
      );

    const gLink = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = svg
      .append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    // Assign node_type a value for determining the size of the circle
    function getNodeRadius(nodeType) {
      switch (nodeType) {
        case "0_role_folder":
          return 10;
        case "1_user_node":
          return 9;
        case "1.5_value_chain":
          return 8;
        case "2_best_practice":
          return 7;
        case "2.5_value_link":
          return 6;
        case "3_process":
          return 5;
        case "4_methodology":
          return 4;
        default:
          return 3.5; // Default size for unknown node types
      }
    }

    function updateTextDecoration(selection) {
      selection.attr("text-decoration", (d) =>
        d._children ? "underline" : "none"
      );
    }

    function update(source) {
      const nodes = root.descendants();
      const links = root.links();

      // Compute the new tree layout.
      // Rows are separated by dx pixels, columns by dy pixels. These names can be counter-intuitive
      // (dx is a height, and dy a width). This because the tree must be viewed with the root at the
      // “bottom”, in the data domain. The width of a column is based on the tree’s height.
      const dx = 50;
      const dy = (width - marginRight - marginLeft) / (root.height + 1);

      tree.nodeSize([dx, dy]);
      tree(root);

      let x0 = Infinity;
      let x1 = -x0;
      root.each((d) => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
      });

      const height = x1 - x0 + dx * 2;

      const transition = svg
        .transition()
        .duration(250)
        .attr("viewBox", [-marginLeft, x0 - dx, width, height])
        .tween(
          "resize",
          window.ResizeObserver ? null : () => () => svg.dispatch("toggle")
        );

      // Update the nodes…
      const node = gNode.selectAll("g").data(nodes, (d) => d.id);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => { // Attempt to remove underline when parent node is expanded
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
          d3.select(event.currentTarget).select("text").call(updateTextDecoration);
        });

      nodeEnter
        .append("circle")
        .attr("r", (d) => getNodeRadius(d.data.node_type)) // Set the circle size based on node_type
        // .attr("r", (d) => (d.children || d._children ? 8 : 3.5)) // Increase the radius for nodes with children
        .attr("fill", (d) => d.data.color || "#000000") // Apply the color schema from the data
        .attr("stroke-width", 10);

      // Display the node name in a tooltip
      nodeEnter.append("title").text(
        (d) =>
          `${d
            .ancestors()
            .map((d) => d.data.name)
            .reverse()}`
      );

      nodeEnter
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", (d) => (d._children ? -16 : 16)) // space b/w bullet & label
        .attr("text-anchor", (d) => (d._children ? "end" : "start"))
        .text((d) =>
          d.data.name.length > 25
            ? d.data.name.substring(0, 25) + "..."
            : d.data.name
        ) // truncate
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white")
        // Display tooltips:
        .attr("paint-order", "stroke")
        .attr("text-decoration", (d) => (d._children ? "underline" : "none")) // Add underline only for nodes with hidden children
        .append("title")
        .text((d) => d.data.name);

      // Update existing nodes to display underline or not
      node.select("text").call(updateTextDecoration);

      // Transition nodes to their new position.
      const nodeUpdate = node
        .merge(nodeEnter)
        .transition(transition)
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      nodeUpdate.select("text").call(updateTextDecoration);

      nodeUpdate
        .select("text")
        .attr("text-decoration", (d) =>
          d.children || d._children ? "underline" : "none"
        ); // remove underline when parent node is expanded

      // Transition exiting nodes to the parent's new position.
      node
        .exit()
        .transition(transition)
        .remove()
        .attr("transform", (d) => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      // Update the links…
      const link = gLink.selectAll("path").data(links, (d) => d.target.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link
        .enter()
        .append("path")
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => source.y0)
            .y((d) => source.x0)
        );

      // Transition links to their new position.
      link
        .merge(linkEnter)
        .transition(transition)
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        );

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => source.y)
            .y((d) => source.x)
        );
        
      // Stash the old positions for transition.
      root.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Initialize the display to show a few nodes.
    root.x0 = 0;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) d.children = null;
    });

    update(root);

    function updateChart() {
      width = document.body.clientWidth;
      svg.attr("viewBox", [0, 0, width, 0]);
      update(root);
    }

    window.addEventListener("resize", updateChart);

    return svg.node();
  } catch (error) {
    console.error("Error in renderTree:", error);
    return null;
  }
};

export default renderTree;
