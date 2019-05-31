import { TETextPosition } from "../types";
import { getCurrentNode } from "../nodeFinders";
import { getNextChar } from "../text";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class MoveCursorByCharCommand extends EditorCommand {
  private offset: number;

  constructor(offset: number) {
    super("MoveCursorByCharCommand");

    this.offset = offset;
  }

  execute(editor: EditorMutator): void {
    const { offset } = this;
    const { cursorAt, selection } = editor.getState();
    const currentNode = getCurrentNode(editor);

    if (!cursorAt || !currentNode) {
      return;
    }

    let p: TETextPosition;

    if (selection) {
      p = offset > 0 ? selection.end : selection.start;
    } else {
      p = cursorAt;
    }

    const nextCursorAt = getNextChar(editor.getNodeMap(), p, offset);

    if (!selection && !nextCursorAt) {
      return;
    }

    editor.updateAttributes({
      cursorAt: nextCursorAt || p,
      selection: null
    });
  }
}
