import {
  TEInternalNode,
  TELeafNode,
  TENodeID,
  TENodeType,
  TETextPosition,
  TETextNode
} from "../types";
import { getFullPath } from "./getFullPath";
import NodeMap from "./NodeMap";

export function splitNodeV2(
  nodeMap: NodeMap,
  splittingType: TENodeType[],
  nodeId: TENodeID,
  ch: number = 0
): TENodeID | undefined {
  const path = getFullPath(nodeMap, nodeId);

  const splittingIndex = path.findIndex(id =>
    splittingType.includes(nodeMap.ensureNode(id).type)
  );

  if (splittingIndex === -1) {
    return;
  }

  let newId: TENodeID | undefined;
  let returnId: TENodeID | undefined;

  for (let i = 0; i <= splittingIndex; i++) {
    const node = nodeMap.ensureNode(path[i]);

    if (nodeMap.schema.isLeafNode(node)) {
      newId = splitLeafNode(nodeMap, node, ch);
    } else if (nodeMap.schema.isInternalNode(node)) {
      newId = splitInternalNode(nodeMap, node, newId!);
    }

    if (returnId === undefined) {
      returnId = newId;
    }
  }

  return returnId;
}

export function splitNode(
  nodeMap: NodeMap,
  cursorAt: TETextPosition,
  splittingType: TENodeType[]
): TETextPosition | undefined {
  const path = getFullPath(nodeMap, cursorAt.id);

  const splittingIndex = path.findIndex(id =>
    splittingType.includes(nodeMap.ensureNode(id).type)
  );

  if (splittingIndex === -1) {
    return;
  }

  let newId: TENodeID | undefined;
  let nextCursorAt: TETextPosition | undefined;

  for (let i = 0; i <= splittingIndex; i++) {
    const node = nodeMap.ensureNode(path[i]);

    if (nodeMap.schema.isLeafNode(node)) {
      newId = splitLeafNode(nodeMap, node, cursorAt.ch);
      nextCursorAt = { id: newId, ch: 0 };
    } else if (nodeMap.schema.isInternalNode(node)) {
      newId = splitInternalNode(nodeMap, node, newId!);
    }
  }

  return nextCursorAt;
}

export function splitLeafNode(
  nodeMap: NodeMap,
  node: TELeafNode,
  ch: number
): TENodeID {
  if (!nodeMap.schema.isTextNode(node) || ch === 0) {
    return node.id;
  }

  nodeMap.updateText(node.id, node.text.slice(0, ch));

  const newNode = nodeMap.insertAfter<TETextNode>(
    node.parent,
    {
      type: "text",
      id: undefined,
      style: node.style,
      text: node.text.slice(ch)
    },
    node.id
  );

  return newNode.id;
}

function splitInternalNode(
  nodeMap: NodeMap,
  node: TEInternalNode,
  prevChildId: TENodeID
): TENodeID {
  const newNode = nodeMap.insertAfter<TEInternalNode>(
    node.parent,
    {
      ...node,
      id: undefined,
      children: []
    },
    node.id
  );

  nodeMap.insertBefore(
    node.id,
    {
      type: "sentinel"
    },
    prevChildId
  );

  const { id } = nodeMap.insertBefore(
    node.id,
    {
      type: "sentinel"
    },
    prevChildId
  );

  const n = nodeMap.ensureNode(node.id) as TEInternalNode;

  const sliceStart = n.children.indexOf(id);
  nodeMap.moveChildren(n.id, newNode.id, n.children.slice(sliceStart));

  return newNode.id;
}
