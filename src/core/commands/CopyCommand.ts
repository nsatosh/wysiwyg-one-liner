import { TETextRange } from "../types";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class CopyCommand extends EditorCommand {
  private range: TETextRange | undefined;

  constructor(range?: TETextRange) {
    super("CopyCommand");

    this.range = range;
  }

  execute(editor: EditorMutator): void {
    this.range;
    console.error("Not Implemented");
  }
}
