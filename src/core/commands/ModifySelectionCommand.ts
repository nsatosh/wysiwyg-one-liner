import { TETextPosition, TENonCanonicalTextPosition } from "../types";
import { isRangeCollapsed } from "../range";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { modifySelection } from "../selection";

export class ModifySelectionCommand extends EditorCommand {
  private to: TETextPosition | TENonCanonicalTextPosition;

  constructor(to: TETextPosition | TENonCanonicalTextPosition) {
    super("ModifySelectionCommand");

    this.to = to;
  }

  execute(editor: EditorMutator): void {
    const { to } = this;
    const { selection, cursorAt } = editor.getState();
    const nodeMap = editor.getNodeMap();

    if (!cursorAt) {
      return;
    }

    const nextSelection = modifySelection(
      nodeMap,
      selection || { start: cursorAt, end: cursorAt, focus: "end" },
      to
    );

    if (!nextSelection) {
      return;
    }

    editor.updateAttributes({
      cursorAt: nextSelection[nextSelection.focus],
      selection: isRangeCollapsed(nextSelection) ? null : nextSelection
    });
  }
}
