import { TEMediaNode } from "../types";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";

export class CancelMediaFormCommand extends EditorCommand {
  constructor() {
    super("CancelMediaFormCommand");
  }

  execute(editor: EditorMutator): void {
    const { mediaForm } = editor.getState();

    if (!mediaForm) {
      return;
    }

    if (mediaForm.id !== undefined) {
      const nodeMap = editor.getNodeMap();
      const mediaNode = nodeMap.ensureNode(mediaForm.id) as TEMediaNode;

      if (!mediaNode.url) {
        nodeMap.deleteNode(mediaNode.id);

        editor.updateNodeMap(nodeMap);
      }
    }

    editor.updateAttributes({
      isActive: true,
      mediaForm: undefined
    });
  }
}
