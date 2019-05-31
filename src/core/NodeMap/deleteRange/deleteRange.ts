import { TETextRange, TETextPosition } from "../../types";
import NodeMap from "../NodeMap";
import { deleteSubtree } from "./deleteSubtree";
import { stitchSubtree, StichingContext } from "./stitchSubtree";
import { getInclusiveSubtree } from "./getInclusiveSubtree";

export function deleteRange(
  nodeMap: NodeMap,
  range: TETextRange
): TETextPosition | null {
  const { root, left, right } = getInclusiveSubtree(nodeMap, range);

  deleteSubtree(nodeMap, root, range);

  const context: StichingContext = {
    range,
    root,
    left,
    right,
    nextCursorAt: null
  };

  stitchSubtree(nodeMap, context);

  return context.nextCursorAt;
}
