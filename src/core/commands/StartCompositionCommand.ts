import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class StartCompositionCommand extends EditorCommand {
  constructor() {
    super("StartCompositionCommand");
  }

  execute(editor: EditorMutator): void {
    editor.updateAttributes({
      inComposition: true
    });
  }
}
