import { TETextPosition } from "../types";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { getCanonicalTextPosition } from "../position";

export class MoveCursorCommand extends EditorCommand {
  position: TETextPosition;

  constructor(position: TETextPosition) {
    super("MoveCursorCommand");

    this.position = position;
  }

  execute(editor: EditorMutator): void {
    const nodeMap = editor.getNodeMap();
    const position = getCanonicalTextPosition(nodeMap, this.position);

    if (!position) {
      return;
    }

    editor.updateAttributes({
      cursorAt: position,
      selection: null
    });
  }
}
