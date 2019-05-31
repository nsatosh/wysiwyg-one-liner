import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { TETextRange } from "../types";

export class CutCommand extends EditorCommand {
  private range: TETextRange | undefined;

  constructor(selection?: TETextRange) {
    super("CutCommand");

    this.range = selection;
  }

  execute(editor: EditorMutator): void {
    this.range;
    console.error("Not Implemented");
  }
}
