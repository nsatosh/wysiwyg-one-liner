import { TETextPosition } from "./types";
import { walkForwardNodes } from "./nodeFinders";
import NodeMap from "./NodeMap/NodeMap";

export function isPositionEquals(
  p1: TETextPosition,
  p2: TETextPosition
): boolean {
  return p1.id === p2.id && p1.ch === p2.ch;
}

export function getCanonicalTextPosition(
  nodeMap: NodeMap,
  pos: TETextPosition
): TETextPosition | undefined {
  if (pos.ch < 0) {
    return;
  }

  const node = nodeMap.getNode(pos.id);

  if (!node) {
    return;
  }

  if (
    nodeMap.schema.isLeafNode(node) &&
    pos.ch < nodeMap.schema.getNodeLength(node)!
  ) {
    return pos;
  }

  let n = pos.ch;
  let p: TETextPosition | undefined;

  walkForwardNodes(nodeMap, node.id, node => {
    if (!nodeMap.schema.isLeafNode(node)) {
      return;
    }

    const len = nodeMap.schema.getNodeLength(node)!;
    const m = n - len;

    if (m < 0) {
      p = { id: node.id, ch: n };
      return true;
    } else {
      n -= len;
    }
  });

  return p;
}
