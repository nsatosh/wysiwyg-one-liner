import {
  getFirstLeaf,
  getSiblingBlockNode,
  walkBackwardNodes,
  walkChars,
  walkForwardNodes
} from "./nodeFinders";
import NodeMap from "./NodeMap/NodeMap";
import { isBranchNode, isLeafNode } from "./nodeTypeGuards";
import { isPositionEquals } from "./position";
import { getIdsInRange } from "./range";
import { TELeafNode, TENodeID, TETextPosition, TETextRange } from "./types";

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
      if (!isLeafNode(node)) {
        return;
      }

      const len = getLeafNodeLength(node);

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
    const L = getLeafNodeLength(nodeMap.ensureNode(cursorAt.id) as TELeafNode);

    let n = Math.abs(cursorAt.ch - L + offset);

    walkBackwardNodes(nodeMap, cursorAt.id, node => {
      if (!isLeafNode(node)) {
        return;
      }

      const len = getLeafNodeLength(node);

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

function getLeafNodeLength(node: TELeafNode): number {
  if (node.type === "media") {
    return 1;
  }

  if (node.type === "sentinel") {
    return 1;
  }

  if (node.end) {
    return 1;
  }

  return node.text.length;
}

export function getNextLine(
  nodeMap: NodeMap,
  cursorAt: TETextPosition,
  dir: -1 | 1
): TETextPosition | undefined {
  const nextLineNode = getSiblingBlockNode(nodeMap, cursorAt, dir);

  if (!nextLineNode) {
    return;
  }

  let nextCursor: TETextPosition = {
    id: getFirstLeaf(nodeMap, nextLineNode).id,
    ch: 0
  };

  let column = calcColumn(nodeMap, cursorAt);

  walkChars(nodeMap, nextCursor, 1, (char, node, ch) => {
    nextCursor = {
      id: node.id,
      ch: ch
    };

    if (column === 0 || (node.type === "text" && node.end)) {
      return true;
    }

    column--;
  });

  return nextCursor;
}

function calcColumn(nodeMap: NodeMap, cursorAt: TETextPosition): number {
  let n: number = 0;

  let skippedFirstChar = false;

  walkChars(nodeMap, cursorAt, -1, (char, node) => {
    if (!skippedFirstChar) {
      skippedFirstChar = true;
      return;
    }

    if (node.type === "text" && node.end) {
      return true;
    }

    n++;
  });

  return Math.max(n, 0);
}

export function getTextNodesInRange(
  nodeMap: NodeMap,
  range: TETextRange
): string {
  const selectedIds = getIdsInRange(nodeMap, range);

  const { start, end } = range;

  return selectedIds
    .reduce(
      (texts, id) => {
        const node = nodeMap.ensureNode(id);

        if (node.type === "text") {
          if (node.end) {
            texts.push("\n");
          } else {
            texts.push(
              node.text
                .slice(
                  node.id === start.id ? start.ch : 0,
                  node.id === end.id ? end.ch : node.text.length
                )
                .join("")
            );
          }
        }

        return texts;
      },
      [] as string[]
    )
    .join("");
}

export function getSubtreeText(nodeMap: NodeMap, nodeId: TENodeID): string {
  const node = nodeMap.ensureNode(nodeId);

  if (isBranchNode(node)) {
    return node.children.map(id => getSubtreeText(nodeMap, id)).join("");
  }

  if (node.type === "text") {
    return node.text.join("");
  }

  return "";
}
