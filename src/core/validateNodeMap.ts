import NodeMap from "./NodeMap/NodeMap";
import { getChildren } from "./nodeFinders";

export function validateNodeMap(nodeMap: NodeMap): void {
  nodeMap.forEach(node => {
    if (nodeMap.schema.isChildNode(node)) {
      const parentNode = nodeMap.getNode(node.parent);

      if (!parentNode) {
        throw new Error(
          `parentNode(${node.parent}) of node(${node.id})  must be found`
        );
      }

      if (!nodeMap.schema.isParentNode(parentNode)) {
        throw new Error("parentNode must have children attribute");
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

        if (!n || !nodeMap.schema.isEndNode(n)) {
          throw new Error("'end' node must be at last of row");
        }
      }
    }
  });
}
