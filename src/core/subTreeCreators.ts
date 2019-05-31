import { TERowNode, TETextNode, TESubTree, TELinkNode } from "./types";
import { generateNewId } from "./nodeIdGenerator";
import NodeMap from "./NodeMap/NodeMap";

export function createEmptySubTree(): TESubTree {
  const id = generateNewId();

  return {
    nodeMap: {
      [id]: {
        id,
        type: "row",
        children: []
      }
    },
    _tempRootId: id
  };
}

export function createLinkTree(
  linkAttrs?: Partial<TELinkNode>,
  textAttrs?: Partial<TETextNode>
): { subtree: TESubTree; link: TELinkNode; text: TETextNode } {
  const subtree = createEmptySubTree();
  const nodeMap = new NodeMap(subtree.nodeMap, true);

  const link = nodeMap.appendChild(subtree._tempRootId, {
    ...linkAttrs,
    type: "link"
  }) as TELinkNode;

  const textNode = nodeMap.appendChild(link.id, {
    ...textAttrs,
    type: "text"
  }) as TETextNode;

  return {
    subtree: {
      _tempRootId: subtree._tempRootId,
      nodeMap: nodeMap.getCurrentState()
    },
    link: nodeMap.getNode(link.id) as TELinkNode,
    text: nodeMap.getNode(textNode.id) as TETextNode
  };
}

export function createRowTree(
  rowAttrs?: Partial<TERowNode>,
  textAttrs?: Partial<TETextNode>
): { subtree: TESubTree; row: TERowNode; text: TETextNode } {
  const subtree = createEmptySubTree();
  const nodeMap = new NodeMap(subtree.nodeMap, true);

  const row = nodeMap.appendChild(subtree._tempRootId, {
    ...rowAttrs,
    type: "row"
  }) as TERowNode;

  const textNode = nodeMap.appendChild(row.id, {
    ...textAttrs,
    type: "text",
    end: true
  }) as TETextNode;

  return {
    subtree: {
      _tempRootId: subtree._tempRootId,
      nodeMap: nodeMap.getCurrentState()
    },
    row: nodeMap.getNode(row.id) as TERowNode,
    text: nodeMap.getNode(textNode.id) as TETextNode
  };
}
