import { TELinkNode } from "../types";
import { ensureExists } from "../ensureExists";
import { getChildNode } from "../nodeFinders";
import EditorCommand from "../EditorCommand";
import NodeMap from "../NodeMap/NodeMap";
import EditorMutator from "../EditorMutator";

export class CancelLinkFormCommand extends EditorCommand {
  constructor() {
    super("CancelLinkFormCommand");
  }

  execute(editor: EditorMutator): void {
    const { linkForm } = editor.getState();

    if (!linkForm) {
      return;
    }

    if (linkForm.id !== undefined) {
      const nodeMap = editor.getNodeMap();
      const linkNode = nodeMap.ensureNode(linkForm.id) as TELinkNode;

      if (deleteLinkNodeIfEmpty(nodeMap, linkNode)) {
        editor.updateNodeMap(nodeMap);
      }
    }

    editor.updateAttributes({
      isActive: true,
      linkForm: undefined
    });
  }
}

function deleteLinkNodeIfEmpty(
  nodeMap: NodeMap,
  linkNode: TELinkNode
): boolean {
  if (linkNode.children.length === 1) {
    const node = ensureExists(getChildNode(nodeMap, linkNode, 0));

    if (node.type === "text" && node.text.length === 0) {
      nodeMap.deleteNode(linkNode.id);

      return true;
    }
  }

  return false;
}
