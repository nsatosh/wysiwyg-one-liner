import NodeMap from "./NodeMap/NodeMap";
import { getChildren } from "./nodeFinders";
import { TETextNode } from "./types";

export function validateNodeMap(nodeMap: NodeMap): void {
  nodeMap.forEach(node => {
    if (nodeMap.schema.isChildNode(node)) {
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

    if (nodeMap.schema.isParentNode(node)) {
      const children = getChildren(nodeMap, node);

      children.forEach(childNode => {
        if (childNode.parent !== node.id) {
          throw new Error(
            `parent attribute of childNode(${childNode.id}) must be ${node.id} but ${childNode.parent}`
          );
        }
      });

      if (node.type === "row") {
        const n = children[children.length - 1];

        if (!n || n.type !== "text" || !(n as TETextNode).end) {
          throw new Error("sentinel node must be found at last of children");
        }
      }
    }
  });
}
