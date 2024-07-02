import { v4 as uuidv4 } from 'uuid';

const parseData = (rawTree) => {
  if (!Array.isArray(rawTree)) {
    console.error('Input is not an array');
    return null;
  }

  let nextKbId = 1;
  const nodeMap = new Map();

  // Step 1 & 2: Check kb_id, update kb_parent_id, and generate unique_id
  const processedTree = rawTree.map(node => {
    if (!node.kb_id || node.kb_id === "N/A") { // assigns a kb_id if missing
      node.kb_id = `generated_${nextKbId++}`;
    }
    if (node.node_type === "0_role_folder" || node.node_type === "0_area_folder") { // collapses the role hierarchy (if needed)
      node.kb_parent_id = "NULL";
    }
    const unique_id = uuidv4();
    const processedNode = {
      ...node,
      unique_id,
      name: node.node_label,
      children: []
    };
    delete processedNode.node_label;
    nodeMap.set(unique_id, processedNode);
    return processedNode;
  });

  // Step 3 & 4: Build hierarchy
  const rootNodes = [];
  processedTree.forEach(node => {
    if (node.kb_parent_id === "NULL") {
      rootNodes.push(node);
    } else {
      const parentNode = processedTree.find(n => n.kb_id === node.kb_parent_id);
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });

  // Step 5: Create root "KB Tree" node
  const hierarchy = {
    name: "KB Tree",
    children: rootNodes
  };

  // Step 6: Clean up hierarchy
  const cleanHierarchy = (node) => {
    if (node.children && node.children.length === 0) {
      delete node.children;
    } else if (node.children) {
      node.children.forEach(cleanHierarchy);
    }
    return node;
  };

  return cleanHierarchy(hierarchy);
};

export default parseData;



// 6/27/24 - This works, except roles map to other roles
// import { v4 as uuidv4 } from 'uuid';

// /**
//  * Transforms rawTree data by checking kb_id, assigning a unique ID to each node, building a hierarchy, and renaming keys.
//  * @param {Array} rawTree - The raw JSON array to process.
//  * @returns {Object} The processed hierarchical structure.
//  */
// const parseData = (rawTree) => {
//   // Ensure rawTree is an array
//   if (!Array.isArray(rawTree)) {
//     throw new Error('Invalid data format: rawTree should be an array.');
//   }

//   // Replace missing kb_id values and generate unique_id
//   const nodes = rawTree.map((node) => ({
//     ...node,
//     kb_id: node.kb_id === "N/A" || !node.kb_id ? uuidv4() : node.kb_id,
//     unique_id: uuidv4(),
//     name: node.node_label,
//     children: [],
//   }));

//   // Create a map of all nodes using their unique_id as the key 
//   const nodesMap = nodes.reduce((acc, node) => {
//     acc[node.unique_id] = node;
//     delete acc[node.unique_id].node_label; // deletes redundant node_label (replaced by name)
//     return acc;
//   }, {});

//   // Build the hierarchy
//   const rootNodes = [];
//   nodes.forEach((node) => {
//     if (node.kb_parent_id === "NULL") {
//       rootNodes.push(node);
//     } else {
//       const parentNode = nodes.find((parent) => parent.kb_id === node.kb_parent_id);
//       if (parentNode) {
//         parentNode.children.push(node);
//       }
//     }
//   });

//   // Remove empty children arrays
//   const cleanNode = (node) => {
//     if (node.children.length === 0) {
//       delete node.children;
//     } else {
//       node.children.forEach(cleanNode);
//     }
//   };

//   rootNodes.forEach(cleanNode);

//   // Create the root "KB Tree" node
//   const tree = {
//     name: "KB Tree",
//     children: rootNodes,
//   };

//   return tree;
// };

// export default parseData;