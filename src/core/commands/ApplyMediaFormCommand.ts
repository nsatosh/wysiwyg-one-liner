import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { getSiblingNode } from "../nodeFinders";
import NodeMap from "../NodeMap/NodeMap";
import { TEMediaForm, TENodeID, TETextPosition } from "../types";
import { splitNode } from "../NodeMap/splitNode";

export class ApplyMediaFormCommand extends EditorCommand {
  constructor() {
    super("ApplyMediaFormCommand");
  }

  execute(editor: EditorMutator): void {
    const { mediaForm, cursorAt } = editor.getState();

    if (!mediaForm || !cursorAt) {
      return;
    }

    const nodeMap = editor.getNodeMap();
    let mediaNodeId: TENodeID;

    if (mediaForm.id === undefined) {
      mediaNodeId = insert(nodeMap, mediaForm, cursorAt);
    } else {
      mediaNodeId = update(nodeMap, mediaForm);
    }

    editor.updateCursorAt({
      id: getSiblingNode(nodeMap, mediaNodeId, 1)!.id,
      ch: 0
    });

    editor.updateNodeMap(nodeMap);
    editor.updateAttributes({
      isActive: true,
      mediaForm: undefined
    });
  }
}

function insert(
  nodeMap: NodeMap,
  form: TEMediaForm,
  cursorAt: TETextPosition
): TENodeID {
  const currentNode = nodeMap.ensureNode(cursorAt.id);
  const p = splitNode(nodeMap, cursorAt, ["text"]);

  if (!p) {
    throw new Error("Unexpected condition");
  }

  const node = nodeMap.insertBefore(
    nodeMap.ensureNode(currentNode.parent!).id,
    {
      type: "media",
      url: form.url,
      size: form.size
    },
    p.id
  );

  return node.id;
}

function update(nodeMap: NodeMap, form: TEMediaForm): TENodeID {
  const node = nodeMap.ensureNode(form.id!);

  if (node.type !== "media") {
    throw new Error("Unexpected condition");
  }

  nodeMap.setNode(node.id, {
    ...node,
    url: form.url,
    size: form.size
  });

  return node.id;
}
