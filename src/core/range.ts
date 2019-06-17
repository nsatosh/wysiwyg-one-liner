import { TENodeID, TETextRange, TENode } from "./types";
import { getFirstLeaf, getLastLeaf, walkForwardNodes } from "./nodeFinders";
import { getInclusiveSubtree } from "./NodeMap/deleteRange/getInclusiveSubtree";
import NodeMap from "./NodeMap/NodeMap";

export function isRangeCollapsed(r: TETextRange) {
  return r.start.id === r.end.id && r.start.ch === r.end.ch;
}

export function isRangeOnSingleNode(r: TETextRange) {
  return r.start.id === r.end.id;
}

export function isRangeEquals(r1: TETextRange, r2: TETextRange) {
  return (
    r1.start.id === r2.start.id &&
    r1.end.id === r2.end.id &&
    r1.start.ch === r2.start.ch &&
    r1.end.ch === r2.end.ch
  );
}

export function isReversedRange(nodeMap: NodeMap, r: TETextRange) {
  if (isRangeCollapsed(r)) {
    return false;
  }

  if (isRangeOnSingleNode(r)) {
    return r.start.ch > r.end.ch;
  }

  const { root, left, right } = getInclusiveSubtree(nodeMap, r);
  const rootNode = nodeMap.ensureNode(root);
  const leftId = left[left.length - 1];
  const rightId = right[right.length - 1];

  if (!leftId || !rightId || !nodeMap.schema.isInternalNode(rootNode)) {
    throw new Error("Unexpeced conditinn");
  }

  return rootNode.children.indexOf(leftId) > rootNode.children.indexOf(rightId);
}

export function getIdsInRange(
  nodeMap: NodeMap,
  range: TETextRange,
  filterCallback?: (node: TENode) => boolean
): TENodeID[] {
  const { start, end } = range;
  const arr = [] as TENodeID[];

  walkForwardNodes(nodeMap, start.id, node => {
    if (filterCallback) {
      if (filterCallback(node)) {
        arr.push(node.id);
      }
    } else {
      arr.push(node.id);
    }

    return node.id === end.id;
  });

  return arr;
}

export function getRangeCoversAll(
  nodeMap: NodeMap,
  rootNodeId: TENodeID
): TETextRange {
  const rootNode = nodeMap.ensureNode(rootNodeId);

  const first = getFirstLeaf(nodeMap, rootNode);
  const last = getLastLeaf(nodeMap, rootNode);

  return {
    start: { id: first.id, ch: 0 },
    end: { id: last.id, ch: 0 }
  };
}
