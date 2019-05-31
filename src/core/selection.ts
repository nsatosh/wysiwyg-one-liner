import { TETextSelection, TETextPosition } from "./types";
import { getCanonicalTextPosition } from "./position";
import { isReversedRange } from "./range";
import NodeMap from "./NodeMap/NodeMap";

export function modifySelection(
  nodeMap: NodeMap,
  selection: TETextSelection,
  nextFocus: TETextPosition
) {
  const anchor = selection[selection.focus === "end" ? "start" : "end"];
  const focus = getCanonicalTextPosition(nodeMap, nextFocus);

  if (!focus) {
    return;
  }

  let nextSelection: TETextSelection;

  if (isReversedRange(nodeMap, { start: anchor, end: focus })) {
    nextSelection = {
      start: focus,
      end: anchor,
      focus: "start"
    };
  } else {
    nextSelection = {
      start: anchor,
      end: focus,
      focus: "end"
    };
  }

  return nextSelection;
}
