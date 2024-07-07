import { v4 as uuidv4 } from "uuid";

const parseData = (rawTree) => {
  if (!Array.isArray(rawTree)) {
    console.error("Input is not an array");
    return null;
  }

  let nextKbId = 1;
  const nodeMap = new Map();

  // Temporary: Transform node_type from the test dataset
  function transformNodeType(nodeType) {
    switch (nodeType) {
      case "0_area_folder":
        return "0_role_folder";
      case "1_standard_node":
        return "1_user_node";
      case "2_control_measure":
        return "2_best_practice";
      case "3_procedure":
        return "3_process";
      case "4_action":
        return "4_methodology";
      default:
        return nodeType;
    }
  }

  // Map colors to node types
  const colorMapping = {
    "0_role_folder": "#4169E1", // "Royal Blue"
    "1_user_node": "#FFA500", // "Orange"
    "1.5_value_chain": "#F00", // "Red"
    "2_best_practice": "#66CDAA", // "MediumAquaMarine"
    "2.5_value_link": "#FFC0CB", // "Pink"
    "3_process": "#ADD8E6", // "LightBlue"
    "4_methodology": "#006400", // "Dark Green"
  };

  // Function to abbreviate common C-level roles
  const substituteNodeLabel = (label) => {
    if (label.includes("Chief Executive Officer")) return "CEO";
    if (label.includes("Chief Operating Officer")) return "COO";
    if (label.includes("Chief Financial Officer")) return "CFO";
    if (label.includes("Chief Information Officer")) return "CIO";
    if (label.includes("Chief Technology Officer")) return "CTO";
    if (label.includes("Chief Marketing Officer")) return "CMO";
    if (label.includes("Chief Human Resources Officer")) return "CHRO";
    if (label.includes("Chief Compliance Officer")) return "CCO";
    if (label.includes("Chief Data Officer")) return "CDO";
    if (label.includes("Chief Risk Officer")) return "CRO";
    if (label.includes("Chief Innovation Officer")) return "CINO";
    if (label.includes("Chief Security Officer")) return "CSO";
    return label;
  };

  // Step 1 & 2: Assign kb_id, update kb_parent_id, and generate unique_id
  const processedTree = rawTree.map((node) => {
    if (!node.kb_id || node.kb_id === "N/A") {
      // assigns a kb_id if missing
      node.kb_id = `generated_${nextKbId++}`;
    }

    const unique_id = uuidv4();
    const transformedNodeType = transformNodeType(node.node_type);
    const processedNode = {
      ...node,
      unique_id,
      name: substituteNodeLabel(node.node_label), // Apply substitution here
      children: [],
      node_type: transformedNodeType,
      color: colorMapping[transformedNodeType] || "#000000", // Assign color based on node_type, default to black if not found
    };
    delete processedNode.node_label;
    nodeMap.set(unique_id, processedNode);
    return processedNode;
  });

  // Step 3 & 4: Build hierarchy
  const rootNodes = [];
  processedTree.forEach((node) => {
    if (node.kb_parent_id === "NULL") {
      rootNodes.push(node);
    } else {
      const parentNode = processedTree.find(
        (n) => n.kb_id === node.kb_parent_id
      );
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });

  // Step 5: Clean up hierarchy
  const cleanHierarchy = (node) => {
    if (node.children && node.children.length === 0) {
      delete node.children;
    } else if (node.children) {
      node.children.forEach(cleanHierarchy);
    }
    return node;
  };

  return cleanHierarchy(rootNodes[0]);
};

export default parseData;
