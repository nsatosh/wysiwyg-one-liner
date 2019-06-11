import { isBranchNode } from "./nodeTypeGuards";
import { TENode, TENodeMap } from "./types";

export function validateNodeMap(
  nodeMap: TENodeMap,
  isSubtree: boolean = false
): TENodeMap {
  Object.keys(nodeMap).forEach(nodeId => {
    const node = nodeMap[nodeId] as TENode;

    if (node.parent) {
      const parentNode = nodeMap[node.parent];

      if (!parentNode) {
        throw new Error(
          `parentNode(${node.parent}) of node(${node.id})  must be found`
        );
      }

      if (!isBranchNode(parentNode)) {
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
        const childNode = nodeMap[childId];

        if (!childNode) {
          throw new Error(`childNode ${childId} must be found`);
        }

        if (childNode.parent !== node.id) {
          throw new Error(
            `parent attribute of childNode(${childNode.id}) must be ${
              node.id
            } but ${childNode.parent}`
          );
        }
      });

      const id = node.children[node.children.length - 1];
      const n = nodeMap[id];

      if (!n || n.type !== "text" || !n.end) {
        throw new Error("sentinel node must be found at last of children");
      }
    }
  });
  return nodeMap;
}
