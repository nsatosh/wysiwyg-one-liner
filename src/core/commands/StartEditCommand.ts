import { TENodeID, TETextPosition } from "../types";
import EditorCommand from "../EditorCommand";
import { getSiblingLeafInSameBlock } from "../nodeFinders";
import EditorMutator from "../EditorMutator";
import { ensureExists } from "../ensureExists";

export class StartEditCommand extends EditorCommand {
  id: TENodeID;
  offset: number;

  constructor(id: TENodeID, offset: number = 0) {
    super("StartEditCommand");

    this.id = id;
    this.offset = offset;
  }

  execute(editor: EditorMutator): void {
    const { id, offset } = this;
    const nodeMap = editor.getNodeMap();

    const node = nodeMap.ensureNode(id);

    if (!nodeMap.schema.isLeafNode(node)) {
      throw new Error(`Unexpected node type ${node.type.toString()}`);
    }

    const len = ensureExists(nodeMap.schema.getNodeLength(node));

    let nextCursotAt: TETextPosition;

    if (len > 0 && offset >= len) {
      const sib = getSiblingLeafInSameBlock(nodeMap, id, 1);

      if (!sib) {
        throw new Error("Unexpected condition");
      }

      nextCursotAt = { id: sib.id, ch: 0 };
    } else {
      nextCursotAt = {
        id: node.id,
        ch: offset
      };
    }

    editor.updateAttributes({
      cursorAt: nextCursotAt,
      selection: null,
      isActive: true
    });
  }
}
