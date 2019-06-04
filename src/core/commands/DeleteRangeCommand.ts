import { TETextRange, TETextPosition } from "../types";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { deleteRange } from "../NodeMap/deleteRange/deleteRange";
import { getNextChar } from "../text";
import NodeMap from "../NodeMap/NodeMap";
import { isPositionEquals } from "../position";

export class DeleteRangeCommand extends EditorCommand {
  private range: TETextRange;

  constructor(range: TETextRange) {
    super("DeleteRangeCommand");

    this.range = range;
  }

  execute(editor: EditorMutator): void {
    const { range } = this;
    const nodeMap = editor.getNodeMap();

    const nextCursorAt = deleteRange(nodeMap, range);
    editor.updateNodeMap(nodeMap);
    editor.updateCursorAt(nextCursorAt);
    editor.updateSelection(null);
  }
}

export class DeleteBackspaceCommand extends EditorCommand {
  constructor() {
    super("DeleteBackspaceCommand");
  }

  execute(editor: EditorMutator): void {
    const nodeMap = editor.getNodeMap();
    let { selection, cursorAt } = editor.getState();

    if (!selection) {
      if (!cursorAt) {
        return;
      }

      const start = findStartPosition(nodeMap, cursorAt);

      if (isPositionEquals(start, cursorAt)) {
        return;
      }

      selection = {
        start,
        end: cursorAt,
        focus: "end"
      };
    }

    const nextCursorAt = deleteRange(nodeMap, selection);
    editor.updateNodeMap(nodeMap);
    editor.updateCursorAt(nextCursorAt);
    editor.updateSelection(null);
  }
}

function findStartPosition(
  nodeMap: NodeMap,
  cursorAt: TETextPosition
): TETextPosition {
  let current: TETextPosition | undefined = cursorAt;

  while (current) {
    const next = getNextChar(nodeMap, current, -1);

    if (!next) {
      return current;
    }

    if (nodeMap.ensureNode(next.id).type !== "sentinel") {
      return next;
    }

    current = next;
  }

  throw new Error("Unexpected condition");
}