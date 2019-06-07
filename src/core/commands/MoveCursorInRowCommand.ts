import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { getFirstLeaf, getLastLeaf } from "../nodeFinders";

export class MoveCursorToStartCommand extends EditorCommand {
  constructor() {
    super("MoveCursorToStartCommand");
  }

  execute(editor: EditorMutator): void {
    const { cursorAt, rootNodeId } = editor.getState();

    if (!cursorAt) {
      return;
    }

    const nodeMap = editor.getNodeMap();
    const rootNode = nodeMap.ensureNode(rootNodeId);

    editor.updateAttributes({
      cursorAt: {
        id: getFirstLeaf(editor.getNodeMap(), rootNode).id,
        ch: 0
      }
    });
  }
}

export class MoveCursorToEndCommand extends EditorCommand {
  constructor() {
    super("MoveCursorToEndCommand");
  }

  execute(editor: EditorMutator): void {
    const { cursorAt, rootNodeId } = editor.getState();

    if (!cursorAt) {
      return;
    }

    const nodeMap = editor.getNodeMap();
    const rootNode = nodeMap.ensureNode(rootNodeId);

    editor.updateAttributes({
      cursorAt: {
        id: getLastLeaf(editor.getNodeMap(), rootNode).id,
        ch: 0
      }
    });
  }
}
