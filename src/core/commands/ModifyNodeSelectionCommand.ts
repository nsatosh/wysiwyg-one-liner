import { TEDirection, TETextPosition } from "../types";
import { isRangeCollapsed } from "../range";
import { getNextChar } from "../text";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { NodeMap } from "..";
import { modifySelection } from "../selection";

export class ModifyNodeSelectionCommand extends EditorCommand {
  private dir: TEDirection;

  constructor(dir: TEDirection) {
    super("ModifyNodeSelectionCommand");

    this.dir = dir;
  }

  execute(editor: EditorMutator): void {
    const { dir } = this;
    const { selection, cursorAt } = editor.getState();

    if (!cursorAt) {
      return;
    }

    const nodeMap = editor.getNodeMap();
    const to = getNextPosition(nodeMap, cursorAt, dir);

    if (!to) {
      return;
    }

    const nextSelection = modifySelection(
      nodeMap,
      selection || { start: cursorAt, end: cursorAt, focus: "end" },
      to
    );

    if (!nextSelection) {
      return;
    }

    editor.updateAttributes({
      cursorAt: nextSelection[nextSelection.focus],
      selection: isRangeCollapsed(nextSelection) ? null : nextSelection
    });
  }
}

function getNextPosition(
  nodeMap: NodeMap,
  cursorAt: TETextPosition,
  dir: TEDirection
): TETextPosition | undefined {
  switch (dir) {
    case TEDirection.left:
      return getNextChar(nodeMap, cursorAt, -1);
    case TEDirection.right:
      return getNextChar(nodeMap, cursorAt, 1);
  }
}
