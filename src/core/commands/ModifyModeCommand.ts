import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { TEMode } from "../types";

export class ModifyModeCommand extends EditorCommand {
  private to: TEMode;

  constructor(to: TEMode) {
    super("ModifyModeCommand");

    this.to = to;
  }

  execute(editor: EditorMutator): void {
    editor.updateAttributes({
      mode: this.to
    });
  }
}
