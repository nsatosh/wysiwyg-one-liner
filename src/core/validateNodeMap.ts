import NodeMap from "./NodeMap/NodeMap";

export function validateNodeMap(nodeMap: NodeMap): void {
  nodeMap.forEach(node => {
    if (node.parent) {
      const parentNode = nodeMap.getNode(node.parent);

      if (!parentNode) {
        throw new Error(
          `parentNode(${node.parent}) of node(${node.id})  must be found`
        );
      }

      if (!nodeMap.schema.isInternalNode(parentNode)) {
        throw new Error("parent node must be branch");
      }

      if (parentNode.children.indexOf(node.id) === -1) {
        throw new Error(
          `parentNode(${parentNode.id}) must have child ${node.id}`
        );
      }
    }

    if (node.type === "row") {
      node.children.forEach(childId => {
        const childNode = nodeMap.getNode(childId);

        if (!childNode) {
          throw new Error(`childNode ${childId} must be found`);
        }

        if (childNode.parent !== node.id) {
          throw new Error(
            `parent attribute of childNode(${childNode.id}) must be ${node.id} but ${childNode.parent}`
          );
        }
      });

      const id = node.children[node.children.length - 1];
      const n = nodeMap.getNode(id);

      if (!n || n.type !== "text" || !n.end) {
        throw new Error("sentinel node must be found at last of children");
      }
    }
  });
}
