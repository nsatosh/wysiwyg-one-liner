import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class ChangeLinkFormCommand extends EditorCommand {
  private _name: string;
  private value: string;

  constructor(name: string, value: string) {
    super("ChangeLinkFormCommand");

    this._name = name;
    this.value = value;
  }

  execute(editor: EditorMutator): void {
    const { _name, value } = this;

    const { linkForm } = editor.getState();

    if (!linkForm) {
      return;
    }

    if (_name === "text") {
      editor.updateAttributes({
        linkForm: { ...linkForm, text: value }
      });
      return;
    }

    editor.updateAttributes({
      linkForm: { ...linkForm, url: value }
    });
  }
}
