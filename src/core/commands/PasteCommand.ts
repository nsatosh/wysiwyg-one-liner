import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { deleteRange } from "../NodeMap/deleteRange/deleteRange";
import { TETextRange, TELeafNode, TETextNode } from "../types";
import { ensureExists } from "../ensureExists";
import { splitNode } from "../NodeMap/splitNode";

export class PasteCommand extends EditorCommand {
  private range?: TETextRange;
  private text: string;

  constructor(text: string, range?: TETextRange) {
    super("PasteCommand");

    this.range = range;
    this.text = text;
  }

  execute(editor: EditorMutator): void {
    const { compositionRange, selection, cursorAt } = editor.getState();

    if (!cursorAt) {
      return;
    }

    const range = this.range || compositionRange || selection;
    const nodeMap = editor.getNodeMap();

    let nextCursorAt = cursorAt;
    if (range) {
      nextCursorAt = ensureExists(deleteRange(nodeMap, range));
    }

    let parent = ensureExists(
      (nodeMap.ensureNode(nextCursorAt.id) as TELeafNode).parent
    );

    this.text.split(/\r?\n/).forEach(line => {
      const newNodeAttrs: Partial<TETextNode> = {
        type: "text",
        text: line.split("")
      };

      nodeMap.insertBefore(parent, newNodeAttrs, nextCursorAt.id);

      const id = splitNode(nodeMap, ["row"], nextCursorAt.id, nextCursorAt.ch)!;

      const node = nodeMap.ensureNode(id) as TELeafNode;
      nextCursorAt = { id: node.id, ch: 0 };
      parent = node.parent;
    });

    editor.updateNodeMap(nodeMap);
    editor.updateCursorAt(nextCursorAt);
    editor.updateSelection(null);
  }
}
