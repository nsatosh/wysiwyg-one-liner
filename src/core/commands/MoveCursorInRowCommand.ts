import { getBeginningOfLine, getEndOfLine } from "../text";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class MoveCursorToStartCommand extends EditorCommand {
  constructor() {
    super("MoveCursorToStartCommand");
  }

  execute(editor: EditorMutator): void {
    const { cursorAt } = editor.getState();

    if (!cursorAt) {
      return;
    }

    editor.updateAttributes({
      cursorAt: getBeginningOfLine(editor.getNodeMap(), cursorAt)
    });
  }
}

export class MoveCursorToEndCommand extends EditorCommand {
  constructor() {
    super("MoveCursorToEndCommand");
  }

  execute(editor: EditorMutator): void {
    const { cursorAt } = editor.getState();

    if (!cursorAt) {
      return;
    }

    editor.updateAttributes({
      cursorAt: getEndOfLine(editor.getNodeMap(), cursorAt)
    });
  }
}
