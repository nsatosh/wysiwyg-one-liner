import { TENodeID } from "../types";
import { getParentNode } from "../nodeFinders";
import NodeMap from "./NodeMap";

export default function deleteNode(
  nodeMap: NodeMap,
  nodeId: TENodeID,
  dontClearEmpty?: boolean
) {
  const removingNode = nodeMap.ensureNode(nodeId);

  if (!nodeMap.schema.isBranchNode(removingNode)) {
    deleteLeafNode(nodeMap, nodeId);
  } else {
    removingNode.children.forEach(childId => {
      deleteNode(nodeMap, childId, true);
    });

    deleteLeafNode(nodeMap, nodeId);
  }

  if (!dontClearEmpty && removingNode.parent) {
    const parentNode = nodeMap.getNode(removingNode.parent);

    if (
      parentNode &&
      nodeMap.schema.isBranchNode(parentNode) &&
      parentNode.children.length === 0
    ) {
      deleteLeafNode(nodeMap, parentNode.id);
    }
  }
}

function deleteLeafNode(nodeMap: NodeMap, nodeId: TENodeID) {
  const removingNode = nodeMap.ensureNode(nodeId);

  if (
    nodeMap.schema.isBranchNode(removingNode) &&
    removingNode.children.length > 0
  ) {
    throw new Error(
      "Before deleting node, children of the node must be cleared or moved to any other node"
    );
  }

  const parentNode = getParentNode(nodeMap, removingNode);

  if (parentNode) {
    nodeMap.setNode(parentNode.id, {
      ...parentNode,
      children: parentNode.children.filter(id => id !== nodeId)
    });
  }

  nodeMap.unsetNode(nodeId);
}
