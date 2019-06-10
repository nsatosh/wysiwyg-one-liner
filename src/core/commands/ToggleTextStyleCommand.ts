import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { isSameStyle } from "../isSameStyle";
import { findBackwardNode, findForwardNode } from "../nodeFinders";
import NodeMap from "../NodeMap/NodeMap";
import { splitNode } from "../NodeMap/splitNode";
import { getIdsInRange } from "../range";
import { TENodeStyleName, TETextRange, TETextSelection } from "../types";

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

    getIdsInRange(
      nodeMap,
      nextSelection,
      node => !(nextSelection.end.ch === 0 && node.id === nextSelection.end.id)
    ).forEach(id => {
      if (nodeMap.ensureNode(id).type === "text") {
        nodeMap.updateStyle(id, styleName);
      }
    });

    const s = joinSameStyleTextNodes(nodeMap, nextSelection);

    editor.updateNodeMap(nodeMap);
    editor.updateCursorAt(s[s.focus]);
    editor.updateSelection(s);
  }
}

function joinSameStyleTextNodes(
  nodeMap: NodeMap,
  currentSelection: TETextSelection
): TETextSelection {
  const ids = getIdsInRange(nodeMap, expandRange(nodeMap, currentSelection));
  const s = { ...currentSelection };

  for (let i = ids.length - 2; i >= 0; i--) {
    const a = nodeMap.ensureNode(ids[i]);
    const b = nodeMap.ensureNode(ids[i + 1]);

    if (
      a.parent === b.parent &&
      a.type === "text" &&
      !a.end &&
      b.type === "text" &&
      !b.end &&
      isSameStyle(a, b)
    ) {
      nodeMap.updateText(a.id, a.text.concat(b.text));
      nodeMap.deleteNode(b.id);

      s.end = { id: a.id, ch: a.text.length };
    }
  }

  return s;
}

function expandRange(nodeMap: NodeMap, range: TETextRange): TETextRange {
  const backward = findBackwardNode(
    nodeMap,
    range.start.id,
    node => node.type === "text"
  );
  const forward = findForwardNode(
    nodeMap,
    range.end.id,
    node => node.type === "text"
  );

  return {
    start: backward ? { id: backward.id, ch: 0 } : range.start,
    end: forward ? { id: forward.id, ch: 0 } : range.end
  };
}
