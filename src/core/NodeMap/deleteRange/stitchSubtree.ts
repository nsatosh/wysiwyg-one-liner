import { ensureExists } from "../../ensureExists";
import { isSameStyle } from "../../isSameStyle";
import { getFirstLeaf, getSiblingNode } from "../../nodeFinders";
import {
  TEInternalNode,
  TEBaseNode,
  TENodeID,
  TETextPosition,
  TETextRange
} from "../../types";
import NodeMap from "../NodeMap";

export interface StichingContext {
  range: TETextRange;
  root: TENodeID;
  left: TENodeID[];
  right: TENodeID[];
  nextCursorAt: TETextPosition | null;
}

export function stitchSubtree(
  nodeMap: NodeMap,
  context: StichingContext
): void {
  let nextNodeId: TENodeID | void = context.root;

  while (nextNodeId) {
    const node = nodeMap.ensureNode(nextNodeId);

    if (node.type === "row") {
      nextNodeId = stitchRow(nodeMap, context);
    } else if (nodeMap.schema.isInlineContainerNode(node)) {
      nextNodeId = stitchInlinerContainer(nodeMap, context);
    } else if (nodeMap.schema.isTextNode(node)) {
      nextNodeId = stitchText(nodeMap, context);
    } else {
      break;
    }
  }
}

function stitchRow(nodeMap: NodeMap, context: StichingContext): void {
  const { left, right } = context;

  const opening = ensureExists(nodeMap.getNode(left.pop()!));
  const closing = ensureExists(nodeMap.getNode(right.pop()!));

  if (getSiblingNode(nodeMap, opening.id, 1) !== closing) {
    return;
  }

  if (nodeMap.schema.isInlineContainerNode(closing)) {
    context.nextCursorAt = { id: closing.children[0], ch: 0 };
  } else {
    context.nextCursorAt = { id: closing.id, ch: 0 };
  }

  if (nodeMap.schema.isTextNode(opening)) {
    if (opening.text.length === 0 || opening.end) {
      nodeMap.deleteNode(opening.id);
      return;
    }

    if (
      !nodeMap.schema.isTextNode(closing) ||
      closing.end ||
      !isSameStyle(opening, closing)
    ) {
      return;
    }

    nodeMap.updateText(closing.id, opening.text.concat(closing.text));
    nodeMap.deleteNode(opening.id);
    context.nextCursorAt = { id: closing.id, ch: opening.text.length };

    return;
  }

  if (nodeMap.schema.isInlineContainerNode(opening)) {
    if (!isEmptyInlineContainer(nodeMap, opening)) {
      return;
    }

    if (nodeMap.schema.isTextNode(closing) && !closing.end) {
      const backward = getSiblingNode(nodeMap, opening.id, -1);
      if (
        backward &&
        nodeMap.schema.isTextNode(backward) &&
        nodeMap.schema.isTextNode(closing) &&
        closing.text.length > 0 &&
        isSameStyle(backward, closing)
      ) {
        nodeMap.updateText(closing.id, backward.text.concat(closing.text));
        nodeMap.deleteNode(backward.id);
        context.nextCursorAt = {
          id: closing.id,
          ch: backward.text.length
        };
      }
    }

    nodeMap.deleteNode(opening.id);
  }
}

function stitchInlinerContainer(
  nodeMap: NodeMap,
  context: StichingContext
): void {
  const { left, right, root } = context;

  const rootNode = nodeMap.ensureNode(root) as TEInternalNode;
  const opening = ensureExists(nodeMap.getNode(left.pop()!));
  const closing = ensureExists(nodeMap.getNode(right.pop()!));

  if (getSiblingNode(nodeMap, opening.id, 1) !== closing) {
    return;
  }

  context.nextCursorAt = { id: closing.id, ch: 0 };

  if (isEmptyInlineContainer(nodeMap, rootNode)) {
    nodeMap.deleteNode(opening.id);
    return;
  }

  if (
    nodeMap.schema.isTextNode(opening) &&
    nodeMap.schema.isTextNode(closing)
  ) {
    nodeMap.updateText(closing.id, opening.text.concat(closing.text));
    nodeMap.deleteNode(opening.id);
    context.nextCursorAt = { id: closing.id, ch: opening.text.length };
  }
}

function stitchText(nodeMap: NodeMap, context: StichingContext): void {
  context.nextCursorAt = context.range.start;
}

function isEmptyInlineContainer(nodeMap: NodeMap, node: TEBaseNode) {
  if (!nodeMap.schema.isInlineContainerNode(node)) {
    return false;
  }

  const firstNode = getFirstLeaf(nodeMap, node);

  if (nodeMap.schema.isTextNode(firstNode) && firstNode.text.length === 0) {
    return true;
  }

  if (node.children.every(id => nodeMap.ensureNode(id).type === "sentinel")) {
    return true;
  }

  return false;
}
