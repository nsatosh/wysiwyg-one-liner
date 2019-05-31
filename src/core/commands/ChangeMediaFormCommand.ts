import { TEMediaForm } from "../types";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class ChangeMediaFormCommand extends EditorCommand {
  private formValues: Partial<TEMediaForm>;

  constructor(formValues: Partial<TEMediaForm>) {
    super("ChangeMediaFormCommand");

    this.formValues = formValues;
  }

  execute(editor: EditorMutator): void {
    const { mediaForm } = editor.getState();

    if (!mediaForm) {
      return;
    }

    editor.updateAttributes({
      mediaForm: { ...mediaForm, ...this.formValues }
    });
  }
}
