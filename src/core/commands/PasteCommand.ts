import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { deleteRange } from "../NodeMap/deleteRange/deleteRange";
import { TETextRange, TELeafNode } from "../types";
import { ensureExists } from "../ensureExists";
import { splitNodeV2 } from "../NodeMap/splitNode";
import { generateNewId } from "../nodeIdGenerator";
import { U } from "../U";

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

    let parent = ensureExists(nodeMap.ensureNode(nextCursorAt.id).parent);

    this.text.split(/\r?\n/).forEach(line => {
      nodeMap.insertBefore(
        parent,
        U.text(generateNewId(), line),
        nextCursorAt.id
      );

      const id = splitNodeV2(
        nodeMap,
        ["row"],
        nextCursorAt.id,
        nextCursorAt.ch
      )!;

      const node = nodeMap.ensureNode(id) as TELeafNode;
      nextCursorAt = { id: node.id, ch: 0 };
      parent = node.parent;
    });

    editor.updateNodeMap(nodeMap);
    editor.updateCursorAt(nextCursorAt);
    editor.updateSelection(null);
  }
}
