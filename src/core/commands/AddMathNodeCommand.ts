import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { ensureExists } from "../ensureExists";
import { getCurrentNode, getParentNode } from "../nodeFinders";
import { TEMathNode, TETextNode } from "../types";
import { splitLeafNode } from "../NodeMap/splitNode";

export class AddMathNodeCommand extends EditorCommand {
  constructor() {
    super("AddMathNodeCommand");
  }

  execute(editor: EditorMutator): void {
    const { cursorAt } = editor.getState();

    if (!cursorAt) {
      return;
    }

    const nodeMap = editor.getNodeMap();
    const currentNode = ensureExists(getCurrentNode(editor));
    const parentNode = ensureExists(getParentNode(nodeMap, currentNode));

    if (!nodeMap.schema.isBlockNode(parentNode)) {
      return;
    }

    const splittedNodeId = splitLeafNode(nodeMap, currentNode, cursorAt.ch);

    const mathNode = nodeMap.insertBefore(
      parentNode.id,
      {
        type: "math"
      },
      splittedNodeId
    ) as TEMathNode;

    nodeMap.appendChild(mathNode.id, {
      type: "sentinel"
    });

    const textNode = nodeMap.appendChild<TETextNode>(mathNode.id, {
      type: "text",
      text: []
    }) as TETextNode;

    nodeMap.appendChild(mathNode.id, {
      type: "sentinel"
    });

    editor.updateSelection(null);
    editor.updateCursorAt({ id: textNode.id, ch: 0 });
    editor.updateNodeMap(nodeMap);
  }
}
