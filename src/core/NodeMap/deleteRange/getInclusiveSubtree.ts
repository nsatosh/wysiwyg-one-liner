import { TENodeID, TETextRange } from "../../types";
import NodeMap from "../NodeMap";
import { getFullPath } from "../getFullPath";

interface Subtree {
  root: TENodeID;
  left: TENodeID[];
  right: TENodeID[];
}

export function getInclusiveSubtree(
  nodeMap: NodeMap,
  range: TETextRange
): Subtree {
  if (range.start.id === range.end.id) {
    return { root: range.start.id, left: [], right: [] };
  }

  const left = getFullPath(nodeMap, range.start.id);
  const right = getFullPath(nodeMap, range.end.id);

  const leftSet = new Set(left);
  const root = right.find(id => leftSet.has(id));

  if (!root) {
    throw new Error("Unexpected condition");
  }

  left.splice(left.findIndex(id => id === root));
  right.splice(right.findIndex(id => id === root));

  return {
    root,
    left,
    right
  };
}
