import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class ToggleDebugMode extends EditorCommand {
  constructor() {
    super("ToggleDebugMode");
  }

  execute(editor: EditorMutator): void {
    editor.updateAttributes({
      inDebug: !editor.getState().inDebug
    });
  }
}
