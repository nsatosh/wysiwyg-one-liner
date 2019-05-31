import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class DisableCursorCommand extends EditorCommand {
  constructor() {
    super("DisableCursorCommand");
  }

  execute(editor: EditorMutator): void {
    editor.updateCursorAt(null);
  }
}
