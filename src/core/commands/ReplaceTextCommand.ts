import { splitGraphemes } from "split-graphemes";
import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { ascendNodes, getSiblingNode } from "../nodeFinders";
import { deleteRange } from "../NodeMap/deleteRange/deleteRange";
import { TEBaseNode, TETextPosition, TETextRange } from "../types";

export class ReplaceTextCommand extends EditorCommand {
  private range?: TETextRange;
  private text: string[];

  constructor(text: string | string[], range?: TETextRange) {
    super("ReplaceTextCommand");

    this.range = range;
    this.text = typeof text === "string" ? splitGraphemes(text) : text;
  }

  execute(editor: EditorMutator): void {
    const { compositionRange, selection } = editor.getState();

    const range = this.range || compositionRange || selection;

    if (range) {
      _delete(editor, range);
    }

    const { cursorAt } = editor.getState();

    if (!cursorAt) {
      return;
    }

    _insert(editor, this.text, cursorAt);
  }
}

function _delete(editor: EditorMutator, range: TETextRange): void {
  const nodeMap = editor.getNodeMap();
  const nextCursorAt = deleteRange(nodeMap, range);

  editor.updateNodeMap(nodeMap);
  editor.updateCursorAt(nextCursorAt);
  editor.updateSelection(null);
}

function _insert(
  editor: EditorMutator,
  text: string[],
  cursorAt: TETextPosition
): void {
  const { inComposition } = editor.getState();
  const nodeMap = editor.getNodeMap();
  const current = nodeMap.ensureNode(cursorAt.id);

  let nextCompositionRange: TETextRange | undefined = undefined;
  let nextCursorAt = cursorAt;

  if (current.type === "text" && !current.end) {
    nodeMap.updateText(current.id, [
      ...current.text.slice(0, cursorAt.ch),
      ...text,
      ...current.text.slice(cursorAt.ch)
    ]);

    nextCursorAt = { id: cursorAt.id, ch: cursorAt.ch + text.length };

    if (inComposition) {
      nextCompositionRange = {
        start: cursorAt,
        end: nextCursorAt
      };
    }
  } else {
    let cur: TEBaseNode = current;
    let back = getSiblingNode(nodeMap, current.id, -1);

    if (!back || back.type !== "text") {
      cur = ascendNodes(nodeMap, current.id, node => {
        if (
          node.parent &&
          nodeMap.schema.isBlockNode(nodeMap.ensureNode(node.parent))
        ) {
          return node;
        }
      }) as TEBaseNode;

      back = getSiblingNode(nodeMap, cur.id, -1);
    }

    if (back && back.type === "text") {
      nodeMap.updateText(back.id, back.text.concat(text));

      if (inComposition) {
        nextCompositionRange = {
          start: { id: back.id, ch: back.text.length },
          end: cursorAt
        };
      }
    } else {
      const { id } = nodeMap.insertBefore(
        cur.parent!,
        {
          type: "text",
          text: text
        },
        cur.id
      );

      if (inComposition) {
        nextCompositionRange = {
          start: { id: id, ch: 0 },
          end: cursorAt
        };
      }
    }
  }

  editor.updateCursorAt(nextCursorAt);

  editor.updateAttributes({
    compositionRange: nextCompositionRange
  });

  editor.updateNodeMap(nodeMap);
}
