import { ensureExists } from "../ensureExists";
import { getParentNode, getCurrentNode } from "../nodeFinders";
import { isBlockNode } from "../nodeTypeGuards";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { TEMediaForm } from "../types";

export class OpenMediaFormCommand extends EditorCommand {
  constructor() {
    super("OpenMediaFormCommand");
  }

  execute(editor: EditorMutator): void {
    const { cursorAt } = editor.getState();

    if (!cursorAt) {
      return;
    }

    const nodeMap = editor.getNodeMap();
    const currentNode = ensureExists(getCurrentNode(editor));
    const parentNode = ensureExists(getParentNode(nodeMap, currentNode));

    if (!isBlockNode(parentNode)) {
      return;
    }

    let form: TEMediaForm;

    if (currentNode.type === "media") {
      form = {
        id: currentNode.id,
        url: currentNode.url,
        size: currentNode.size
      };
    } else {
      form = {
        url: "",
        size: {
          width: 0,
          height: 0
        }
      };
    }

    editor.updateAttributes({
      mediaForm: form
    });
    editor.updateSelection(null);
  }
}
