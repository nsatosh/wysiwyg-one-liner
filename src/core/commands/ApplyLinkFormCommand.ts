import EditorCommand from "../EditorCommand";
import EditorMutator from "../EditorMutator";
import { getFirstLeaf, getSiblingNode } from "../nodeFinders";
import NodeMap from "../NodeMap/NodeMap";
import { splitNode } from "../NodeMap/splitNode";
import { TELinkForm, TELinkNode, TENodeID, TETextPosition } from "../types";
import { U } from "../U";
import { generateNewId } from "../nodeIdGenerator";

export class ApplyLinkFormCommand extends EditorCommand {
  constructor() {
    super("ApplyLinkFormCommand");
  }

  execute(editor: EditorMutator): void {
    const { linkForm, cursorAt } = editor.getState();

    if (!linkForm || !cursorAt) {
      return;
    }

    const nodeMap = editor.getNodeMap();
    let linkNodeId: TENodeID;

    if (linkForm.id === undefined) {
      linkNodeId = insert(nodeMap, linkForm, cursorAt);
    } else {
      linkNodeId = update(nodeMap, linkForm);
    }

    editor.updateCursorAt({
      id: getFirstLeaf(nodeMap, getSiblingNode(nodeMap, linkNodeId, 1)!).id,
      ch: 0
    });

    editor.updateNodeMap(nodeMap);
    editor.updateAttributes({
      isActive: true,
      linkForm: undefined
    });
  }
}

function insert(
  nodeMap: NodeMap,
  form: TELinkForm,
  cursorAt: TETextPosition
): TENodeID {
  const currentNode = nodeMap.ensureNode(cursorAt.id);
  const p = splitNode(nodeMap, cursorAt, ["text"]);

  if (!p) {
    throw new Error("Unexpected condition");
  }

  const linkNode = nodeMap.insertBefore(
    nodeMap.ensureNode(currentNode.parent!).id,
    {
      type: "link",
      url: form.url
    },
    p.id
  ) as TELinkNode;

  nodeMap.appendChild(linkNode.id, U.sentinel(generateNewId()));

  nodeMap.appendChild(linkNode.id, {
    type: "text",
    text: getTextFromForm(form)
  });

  nodeMap.appendChild(linkNode.id, U.sentinel(generateNewId()));

  return linkNode.id;
}

function update(nodeMap: NodeMap, form: TELinkForm): TENodeID {
  const node = nodeMap.ensureNode(form.id!);

  if (node.type !== "link") {
    throw new Error("Unexpected condition");
  }

  nodeMap.updateText(node.children[0], getTextFromForm(form));
  nodeMap.updateUrl(node.id, form.url);

  return node.id;
}

function getTextFromForm(form: TELinkForm): string[] {
  return (form.text || form.url).split("");
}
