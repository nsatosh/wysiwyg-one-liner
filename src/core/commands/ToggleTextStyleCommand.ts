import { TENodeStyleName, TENodeID, TETextSelection } from "../types";
import { getIdsInRange } from "../range";
import EditorCommand from "../EditorCommand";
import NodeMap from "../NodeMap/NodeMap";
import EditorMutator from "../EditorMutator";
import { getBackwardNodeId, getForwardNodeId } from "../nodeFinders";
import { isSameStyle } from "../isSameStyle";
import { splitNode } from "../NodeMap/splitNode";

export class ToggleTextStyleCommand extends EditorCommand {
  private styleName: TENodeStyleName;

  constructor(styleName: TENodeStyleName) {
    super("ToggleTextStyleCommand");

    this.styleName = styleName;
  }

  execute(editor: EditorMutator): void {
    const { styleName } = this;
    const { selection } = editor.getState();

    if (!selection) {
      return;
    }

    const nodeMap = editor.getNodeMap();

    const nextEnd = splitNode(nodeMap, selection.end, ["text"]);
    const nextStart = splitNode(nodeMap, selection.start, ["text"]);

    const nextSelection: TETextSelection = {
      start: nextStart || selection.start,
      end: nextEnd || selection.end,
      focus: selection.focus
    };

    const ids = getIdsInRange(
      nodeMap,
      nextSelection,
      node => !(nextSelection.end.ch === 0 && node.id === nextSelection.end.id)
    );

    ids.forEach(id => {
      nodeMap.updateStyle(id, styleName);
    });

    const s = joinSameStyleTextNodes(
      nodeMap,
      ids[0],
      ids[ids.length - 1],
      nextSelection
    );

    editor.updateNodeMap(nodeMap);
    editor.updateCursorAt(s[s.focus]);
    editor.updateSelection(s);
  }
}

function joinSameStyleTextNodes(
  nodeMap: NodeMap,
  openingId: TENodeID,
  closingId: TENodeID,
  currentSelection: TETextSelection
): TETextSelection {
  const backwardId = getBackwardNodeId(nodeMap, openingId);
  const forwardId = getForwardNodeId(nodeMap, closingId);
  const s = { ...currentSelection };

  if (backwardId) {
    const opening = nodeMap.ensureNode(openingId);

    if (opening.type !== "text" || opening.end) {
      return currentSelection;
    }

    const node = nodeMap.ensureNode(backwardId);

    if (node.type === "text" && !node.end && isSameStyle(node, opening)) {
      nodeMap.updateText(opening.id, node.text.concat(opening.text));
      nodeMap.deleteNode(node.id);

      s.start = { id: opening.id, ch: node.text.length };
    }
  }

  if (forwardId) {
    const closing = nodeMap.ensureNode(closingId);

    if (closing.type !== "text" || closing.end) {
      return currentSelection;
    }

    const node = nodeMap.ensureNode(forwardId);

    if (node.type === "text" && !node.end && isSameStyle(closing, node)) {
      nodeMap.updateText(closing.id, closing.text.concat(node.text));
      nodeMap.deleteNode(node.id);

      s.end = { id: closing.id, ch: closing.text.length };
    }
  }

  return s;
}
