import { getRangeCoversAll, isRangeCollapsed } from "../range";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class SelectAllNodesCommand extends EditorCommand {
  constructor() {
    super("SelectAllNodesCommand");
  }

  execute(editor: EditorMutator): void {
    const { rootNodeId } = editor.getState();

    const r = getRangeCoversAll(editor.getNodeMap(), rootNodeId);

    if (isRangeCollapsed(r)) {
      return;
    }

    editor.updateAttributes({
      cursorAt: r.end,
      selection: { ...r, focus: "end" }
    });
  }
}
