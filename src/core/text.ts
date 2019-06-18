import { walkBackwardNodes, walkForwardNodes } from "./nodeFinders";
import NodeMap from "./NodeMap/NodeMap";
import { isPositionEquals } from "./position";
import { TENodeID, TETextPosition } from "./types";

export function getNextChar(
  nodeMap: NodeMap,
  cursorAt: TETextPosition,
  offset: number
): TETextPosition | undefined {
  if (offset === 0) {
    return cursorAt;
  }

  let nextCursorAt: TETextPosition | undefined;

  if (offset > 0) {
    let n = cursorAt.ch + offset;

    walkForwardNodes(nodeMap, cursorAt.id, node => {
      if (!nodeMap.schema.isLeafNode(node)) {
        return;
      }

      const len = nodeMap.schema.getNodeLength(node)!;

      if (n < len) {
        nextCursorAt = {
          id: node.id,
          ch: n
        };

        return true;
      }

      n -= len;
    });
  } else {
    const L = nodeMap.schema.getNodeLength(nodeMap.ensureNode(cursorAt.id))!;

    let n = Math.abs(cursorAt.ch - L + offset);

    walkBackwardNodes(nodeMap, cursorAt.id, node => {
      if (!nodeMap.schema.isLeafNode(node)) {
        return;
      }

      const len = nodeMap.schema.getNodeLength(node)!;

      if (n <= len) {
        nextCursorAt = {
          id: node.id,
          ch: len - n
        };

        return true;
      }

      n -= len;
    });
  }

  if (nextCursorAt && isPositionEquals(cursorAt, nextCursorAt)) {
    return;
  }

  return nextCursorAt;
}

export function getSubtreeText(nodeMap: NodeMap, nodeId: TENodeID): string {
  const node = nodeMap.ensureNode(nodeId);

  if (nodeMap.schema.isInternalNode(node)) {
    return node.children.map(id => getSubtreeText(nodeMap, id)).join("");
  }

  const text = nodeMap.schema.getText(node);

  if (text) {
    return text.join("");
  }

  return "";
}
