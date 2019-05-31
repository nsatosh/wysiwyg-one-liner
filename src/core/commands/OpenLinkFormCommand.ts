import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { ensureExists } from "../ensureExists";
import { getCurrentNode } from "../nodeFinders";
import { getSubtreeText } from "../text";
import { TELinkForm } from "../types";

export class OpenLinkFormCommand extends EditorCommand {
  constructor() {
    super("OpenLinkFormCommand");
  }

  execute(editor: EditorMutator): void {
    const { cursorAt } = editor.getState();

    if (!cursorAt) {
      return;
    }

    const nodeMap = editor.getNodeMap();
    const currentNode = ensureExists(getCurrentNode(editor));
    const parentNode = nodeMap.ensureNode(currentNode.parent);
    let form: TELinkForm;

    if (parentNode.type === "link") {
      form = {
        id: parentNode.id,
        url: parentNode.url,
        text: ensureExists(getSubtreeText(nodeMap, parentNode.id))
      };
    } else {
      form = {
        url: "",
        text: ""
      };
    }

    editor.updateAttributes({
      linkForm: form
    });

    editor.updateSelection(null);
  }
}
