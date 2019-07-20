import EditorCommand from "../../src/core/EditorCommand";
import EditorMutator from "../../src/core/EditorMutator";
import { findBackwardNode, findForwardNode } from "../../src/core/nodeFinders";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { splitNode } from "../../src/core/NodeMap/splitNode";
import { getIdsInRange } from "../../src/core/range";
import { TENodeID, TETextRange, TETextSelection } from "../../src/core/types";
import { isSameStyle } from "./isSameStyle";
import { TENodeStyleName, StyledTextNode } from "./StyledTextNode";

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

    const nextEnd = splitNode(
      nodeMap,
      ["text"],
      selection.end.id,
      selection.end.ch
    );
    const nextStart = splitNode(
      nodeMap,
      ["text"],
      selection.start.id,
      selection.start.ch
    );

    const nextSelection: TETextSelection = {
      start: nextStart ? { id: nextStart, ch: 0 } : selection.start,
      end: nextEnd ? { id: nextEnd, ch: 0 } : selection.end,
      focus: selection.focus
    };

    getIdsInRange(
      nodeMap,
      nextSelection,
      node => !(nextSelection.end.ch === 0 && node.id === nextSelection.end.id)
    ).forEach(id => {
      if (nodeMap.ensureNode(id).type === "text") {
        updateStyle(nodeMap, id, styleName);
      }
    });

    const s = joinSameStyleTextNodes(nodeMap, nextSelection);

    editor.updateNodeMap(nodeMap);
    editor.updateCursorAt(s[s.focus]);
    editor.updateSelection(s);
  }
}

function updateStyle(
  nodeMap: NodeMap,
  id: TENodeID,
  styleName: TENodeStyleName
): void {
  const node = nodeMap.ensureNode(id) as StyledTextNode;

  if (nodeMap.schema.isTextNode(node)) {
    const nextStyle = { ...node.style };

    if (!nextStyle[styleName]) {
      nextStyle[styleName] = true;
    } else {
      delete nextStyle[styleName];
    }

    nodeMap.setNode(node.id, {
      ...node,
      style: nextStyle
    });
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
      nodeMap.schema.isChildNode(a) &&
      nodeMap.schema.isChildNode(b) &&
      a.parent === b.parent &&
      nodeMap.schema.isTextNode(a) &&
      nodeMap.schema.isTextNode(b) &&
      isSameStyle(a as StyledTextNode, b as StyledTextNode)
    ) {
      nodeMap.updateText(a.id, a.text.concat(b.text));
      nodeMap.deleteNode(b.id);

      s.end = { id: a.id, ch: a.text.length };
    }
  }

  return s;
}

function expandRange(nodeMap: NodeMap, range: TETextRange): TETextRange {
  const backward = findBackwardNode(nodeMap, range.start.id, node =>
    nodeMap.schema.isTextNode(node)
  );
  const forward = findForwardNode(nodeMap, range.end.id, node =>
    nodeMap.schema.isTextNode(node)
  );

  return {
    start: backward ? { id: backward.id, ch: 0 } : range.start,
    end: forward ? { id: forward.id, ch: 0 } : range.end
  };
}
