import * as ImmutableArray from "@immutable-array/prototype";
import { ensureExists } from "../ensureExists";
import { getParentNode } from "../nodeFinders";
import { isBranchNode, isLeafNode } from "../nodeTypeGuards";
import { TEBranchNode, TENodeID } from "../types";
import NodeMap from "./NodeMap";

export function moveChildren(
  nodeMap: NodeMap,
  fromId: TENodeID,
  toId: TENodeID,
  children: TENodeID[],
  beforeId?: TENodeID,
  afterId?: TENodeID
) {
  if (children.length === 0) {
    return;
  }

  const fromNode = nodeMap.ensureNode(fromId);

  if (!isBranchNode(fromNode)) {
    throw new Error("The node specified with fromId must be an section");
  }

  nodeMap.setNode(fromNode.id, {
    ...fromNode,
    children: fromNode.children.filter(id => children.indexOf(id) === -1)
  });

  children.forEach(childId => {
    const node = nodeMap.ensureNode(childId);

    if (fromId !== node.parent) {
      throw new Error(
        `All parent of specified children are expected to be ${fromId}, but ${node.parent} found`
      );
    }

    nodeMap.setNode(node.id, {
      ...node,
      parent: toId
    });
  });

  const nextFromNode = nodeMap.ensureNode(fromNode.id) as TEBranchNode;

  if (nextFromNode.children.length === 0) {
    nodeMap.deleteNode(fromNode.id);
  }

  const toNode = nodeMap.ensureNode(toId);

  if (!isBranchNode(toNode)) {
    throw new Error("The node specified with toId must be an section");
  }

  if (beforeId !== undefined) {
    const i = toNode.children.indexOf(beforeId);

    if (i === -1) {
      console.log(
        `specified beforeId(${beforeId}) was not found in toNode.children`
      );
    }

    nodeMap.setNode(toNode.id, {
      ...toNode,
      children: ImmutableArray.splice(toNode.children, i + 1, 0, ...children)
    });
  } else if (afterId !== undefined) {
    const i = toNode.children.indexOf(afterId);

    if (i === -1) {
      console.log(
        `specified beforeId(${beforeId}) was not found in toNode.children`
      );
    }

    nodeMap.setNode(toNode.id, {
      ...toNode,
      children: ImmutableArray.splice(toNode.children, i - 1, 0, ...children)
    });
  } else {
    nodeMap.setNode(toNode.id, {
      ...toNode,
      children: [...toNode.children, ...children]
    });
  }
}

export function moveExistingNode(
  nodeMap: NodeMap,
  nodeId: TENodeID,
  toParentNodeId: TENodeID,
  to: "after" | "before",
  referenceNodeId?: TENodeID
) {
  const node = nodeMap.ensureNode(nodeId);
  const fromParentNode = ensureExists(getParentNode(nodeMap, node));

  nodeMap.setNode(fromParentNode.id, {
    ...fromParentNode,
    children: ImmutableArray.splice(
      fromParentNode.children,
      fromParentNode.children.indexOf(nodeId),
      1
    )
  });

  const toParentNode = nodeMap.ensureNode(toParentNodeId);

  if (!isBranchNode(toParentNode)) {
    throw new Error("parent node must be branch");
  }

  if (referenceNodeId === undefined) {
    nodeMap.setNode(toParentNode.id, {
      ...toParentNode,
      children:
        to === "after"
          ? [...toParentNode.children, nodeId]
          : [nodeId, ...toParentNode.children]
    });

    return;
  }

  const referenceNode = nodeMap.ensureNode(referenceNodeId);
  const i = toParentNode.children.indexOf(referenceNode.id);

  nodeMap.setNode(toParentNode.id, {
    ...toParentNode,
    children:
      to === "after"
        ? ImmutableArray.splice(toParentNode.children, i + 1, 0, nodeId)
        : ImmutableArray.splice(
            toParentNode.children,
            i,
            1,
            nodeId,
            referenceNode.id
          )
  });
}

export function flattenChildren(nodeMap: NodeMap, nodeId: TENodeID) {
  const node = nodeMap.ensureNode(nodeId);

  if (isLeafNode(node) || !node.parent) {
    return;
  }

  const parentNode = getParentNode(nodeMap, node)!;
  const indexOfNode = parentNode.children.indexOf(node.id);

  nodeMap.setNode(parentNode.id, {
    ...parentNode,
    children: ImmutableArray.splice(
      parentNode.children,
      indexOfNode,
      1,
      ...node.children
    )
  });

  node.children.forEach(id => {
    const childNode = nodeMap.ensureNode(id);

    nodeMap.setNode(id, {
      ...childNode,
      parent: parentNode.id
    });
  });

  nodeMap.unsetNode(node.id);
}
