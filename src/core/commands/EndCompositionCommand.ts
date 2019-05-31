import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class EndCompositionCommand extends EditorCommand {
  constructor() {
    super("EndCompositionCommand");
  }

  execute(editor: EditorMutator): void {
    editor.updateAttributes({
      inComposition: false,
      compositionRange: undefined,
      compositionFocusedRange: undefined
    });
  }
}
