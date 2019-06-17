import EditorMutator from "./EditorMutator";
import { ensureExists } from "./ensureExists";
import NodeMap from "./NodeMap/NodeMap";
import { TEInternalNode, TELeafNode, TEBaseNode, TENodeID } from "./types";

export function findNode(
  nodeMap: NodeMap,
  callback: (node: TEBaseNode) => boolean | void
): TEBaseNode | undefined {
  let found: TEBaseNode | undefined;

  nodeMap.forEach(node => {
    if (callback(node)) {
      found = node;
      return true;
    }
  });

  return found;
}

export function getCurrentNode(editor: EditorMutator): TELeafNode | undefined {
  const { cursorAt } = editor.getState();
  const nodeMap = editor.getNodeMap();

  if (cursorAt === null) {
    return undefined;
  }

  const found = nodeMap.ensureNode(cursorAt.id);

  if (!nodeMap.schema.isLeafNode(found)) {
    throw new Error("current node must be text or link");
  }

  return found;
}

export function getSiblingNode(
  nodeMap: NodeMap,
  nodeId: TENodeID,
  offset: number
): TEBaseNode | undefined {
  const node = nodeMap.ensureNode(nodeId);
  const parentNode = getParentNode(nodeMap, node);

  if (parentNode === undefined) {
    return;
  }

  const { children } = parentNode;
  const i = children.indexOf(node.id);

  if (i === -1) {
    throw new Error(
      "NodeID of fromNode must be included in parentNode's children"
    );
  }

  const siblingId = children[i + offset];

  if (siblingId === undefined) {
    return;
  }

  return nodeMap.getNode(siblingId);
}

export function getSiblingLeafInSameBlock(
  nodeMap: NodeMap,
  nodeId: TENodeID,
  dir: -1 | 1
): TELeafNode | undefined {
  const node = nodeMap.ensureNode(nodeId);
  const parent = ensureExists(getParentNode(nodeMap, node));
  const sibling = getSiblingNode(nodeMap, nodeId, dir);

  if (!sibling) {
    if (!nodeMap.schema.isInlineContainerNode(parent)) {
      return;
    }

    return getSiblingLeafInSameBlock(nodeMap, parent.id, dir);
  }

  if (nodeMap.schema.isLeafNode(sibling)) {
    return sibling;
  }

  if (sibling.type === "link") {
    return getChildNode(
      nodeMap,
      sibling,
      dir === -1 ? sibling.children.length - 1 : 0
    ) as TELeafNode;
  }
}

export function getParentNode(
  nodeMap: NodeMap,
  childNode: TEBaseNode
): TEInternalNode | undefined {
  if (childNode.parent === undefined) {
    return;
  }

  const parentNode = nodeMap.ensureNode(childNode.parent);

  if (!nodeMap.schema.isInternalNode(parentNode)) {
    throw new Error("parentNode must have children attribute");
  }

  return parentNode;
}

export function getSiblingIds(
  nodeMap: NodeMap,
  node: TEBaseNode
): TENodeID[] | undefined {
  const parentNode = getParentNode(nodeMap, node);

  if (!parentNode) {
    return;
  }

  return parentNode.children;
}

export function walkByDepthFirst(
  nodeMap: NodeMap,
  startNodeId: TENodeID,
  callback: (node: TEBaseNode) => void
): "terminate" | void {
  const node = nodeMap.ensureNode(startNodeId);

  callback(node);

  if (nodeMap.schema.isLeafNode(node)) {
    return;
  }

  for (let i = 0; i < node.children.length; ++i) {
    walkByDepthFirst(nodeMap, node.children[i], callback);
  }
}

export function getChildNode(
  nodeMap: NodeMap,
  parentNode: TEInternalNode,
  index: number
): TEBaseNode | undefined {
  if (nodeMap.getNode(parentNode.id) !== parentNode) {
    throw new Error("specified node does not exist in nodeMap");
  }

  const id = parentNode.children[index];

  if (id === undefined) {
    return;
  }

  return nodeMap.ensureNode(id);
}

export function getChildren(
  nodeMap: NodeMap,
  parentNode: TEInternalNode
): TEBaseNode[] {
  return parentNode.children.map(id => nodeMap.ensureNode(id));
}

export function findForwardNode(
  nodeMap: NodeMap,
  startNodeId: TENodeID,
  callback: (node: TEBaseNode) => boolean | void
): TEBaseNode | undefined {
  let result: TEBaseNode | undefined;

  walkForwardNodes(nodeMap, startNodeId, node => {
    if (callback(node)) {
      result = node;
    }
  });

  return result;
}

export function walkForwardNodes(
  nodeMap: NodeMap,
  startNodeId: TENodeID,
  callback: (node: TEBaseNode) => boolean | void
): void {
  let id: TENodeID | undefined = startNodeId;

  while (id) {
    const node = nodeMap.getNode(id);

    if (!node || callback(node)) {
      return;
    }

    id = getForwardNodeId(nodeMap, id);
  }
}

export function getForwardNode(
  nodeMap: NodeMap,
  id: TENodeID
): TEBaseNode | undefined {
  const b = getForwardNodeId(nodeMap, id);

  if (b) {
    return nodeMap.ensureNode(b);
  }
}

export function getForwardNodeId(
  nodeMap: NodeMap,
  id: TENodeID
): TENodeID | undefined {
  const node = nodeMap.getNode(id);

  if (!node) {
    return;
  }

  if (nodeMap.schema.isInternalNode(node)) {
    return node.children[0];
  }

  let current: TEBaseNode | undefined = node;

  do {
    const sib = getSiblingNode(nodeMap, current.id, 1);

    if (sib) {
      return sib.id;
    }

    current = getParentNode(nodeMap, current);
  } while (current);
}

export function findBackwardNode(
  nodeMap: NodeMap,
  startNodeId: TENodeID,
  callback: (node: TEBaseNode) => boolean | void
): TEBaseNode | undefined {
  let result: TEBaseNode | undefined;

  walkBackwardNodes(nodeMap, startNodeId, node => {
    if (callback(node)) {
      result = node;
    }
  });

  return result;
}

export function walkBackwardNodes(
  nodeMap: NodeMap,
  startNodeId: TENodeID,
  callback: (node: TEBaseNode) => boolean | void
): void {
  let id: TENodeID | undefined = startNodeId;

  while (id) {
    const node = nodeMap.getNode(id);

    if (!node || callback(node)) {
      return;
    }

    id = getBackwardNodeId(nodeMap, id);
  }
}

export function getBackwardNode(
  nodeMap: NodeMap,
  id: TENodeID
): TEBaseNode | undefined {
  const b = getBackwardNodeId(nodeMap, id);

  if (b) {
    return nodeMap.ensureNode(b);
  }
}

export function getBackwardNodeId(
  nodeMap: NodeMap,
  id: TENodeID
): TENodeID | undefined {
  const node = nodeMap.getNode(id);

  if (!node) {
    return;
  }

  const sib = getSiblingNode(nodeMap, id, -1);

  if (sib) {
    return getLastLeaf(nodeMap, sib).id;
  }

  const parent = getParentNode(nodeMap, node);

  if (parent) {
    return parent.id;
  }
}

export function ascendNodes<T>(
  nodeMap: NodeMap,
  fromId: TENodeID,
  callback: (node: TEBaseNode) => T | void
): T | void {
  let id: TENodeID | undefined = fromId;
  let node: TEBaseNode;

  do {
    node = nodeMap.ensureNode(id);

    const result = callback(node);

    if (result) {
      return result;
    }

    id = node.parent;
  } while (id);
}

export function getFirstLeaf(
  nodeMap: NodeMap,
  parentNode: TEBaseNode
): TELeafNode {
  if (!nodeMap.schema.isInternalNode(parentNode)) {
    return parentNode;
  }

  return getFirstLeaf(nodeMap, nodeMap.ensureNode(parentNode.children[0]));
}

export function getLastLeaf(
  nodeMap: NodeMap,
  parentNode: TEBaseNode
): TELeafNode {
  if (!nodeMap.schema.isInternalNode(parentNode)) {
    return parentNode;
  }

  return getLastLeaf(
    nodeMap,
    nodeMap.ensureNode(parentNode.children[parentNode.children.length - 1])
  );
}
