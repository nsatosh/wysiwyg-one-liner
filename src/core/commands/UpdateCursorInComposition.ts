import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { splitGraphemes } from "split-graphemes";

export class UpdateCursorInComposition extends EditorCommand {
  srcText: string;
  selectionStart: number;
  selectionEnd: number;

  constructor(srcText: string, selectionStart: number, selectionEnd: number) {
    super("UpdateCursorInComposition");

    this.srcText = srcText;
    this.selectionStart = selectionStart;
    this.selectionEnd = selectionEnd;
  }

  execute(editor: EditorMutator): void {
    const { srcText, selectionStart, selectionEnd } = this;
    const { compositionRange } = editor.getState();
    const nodeMap = editor.getNodeMap();

    if (!compositionRange) {
      return;
    }

    const node = nodeMap.getNode(compositionRange.start.id);

    if (!node || node.type !== "text") {
      return;
    }

    const graphemes = splitGraphemes(srcText);
    const start = findGraphemeIndex(graphemes, selectionStart);
    const end = findGraphemeIndex(graphemes, selectionStart);

    if (selectionStart !== selectionEnd) {
      editor.updateAttributes({
        compositionFocusedRange: {
          start: {
            id: node.id,
            ch: compositionRange.start.ch + start
          },
          end: {
            id: node.id,
            ch: compositionRange.start.ch + end
          }
        }
      });
    }

    editor.updateAttributes({
      cursorAt: {
        id: node.id,
        ch: compositionRange.start.ch + start
      }
    });
  }
}

function findGraphemeIndex(graphemes: string[], target: number): number {
  let ch = 0;

  const i = graphemes.findIndex(g => {
    if (ch === target) {
      return true;
    }

    ch += g.length;

    return false;
  });

  return i >= 0 ? i : graphemes.length;
}
