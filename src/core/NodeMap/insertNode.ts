import * as ImmutableArray from "@immutable-array/prototype";
import { TENodeID, TEBaseNode, TESubTree, TEInternalNode } from "../types";
import NodeMap from "./NodeMap";
import { generateNewId } from "../nodeIdGenerator";

export function insertNode<T extends TEBaseNode>(
  nodeMap: NodeMap,
  parentNodeId: TENodeID,
  attrs: Partial<T> | TESubTree,
  referenceNodeId: TENodeID | undefined,
  to: "after" | "before"
): Readonly<TEBaseNode> {
  if (isSubTree(attrs)) {
    return insertSubTree(nodeMap, parentNodeId, attrs, referenceNodeId, to);
  }

  const parentNode = nodeMap.ensureNode(parentNodeId);

  if (!nodeMap.schema.isInternalNode(parentNode)) {
    throw new Error("parentNode must have children attribute");
  }

  const node = makeNewNode(nodeMap, attrs, parentNodeId);

  nodeMap.setNode(node.id, node);

  updateReference(nodeMap, parentNodeId, [node.id], referenceNodeId, to);

  return node;
}

function isSubTree(obj: any): obj is TESubTree {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  return (
    (obj as TESubTree).nodeMap && (obj as TESubTree)._tempRootId !== undefined
  );
}

function insertSubTree(
  nodeMap: NodeMap,
  parentNodeId: TENodeID,
  subtree: TESubTree,
  referenceNodeId: TENodeID | undefined,
  to: "after" | "before"
): Readonly<TEBaseNode> {
  Object.keys(subtree.nodeMap).forEach(id => {
    if (id === subtree._tempRootId) {
      return;
    }

    nodeMap.setNode(id, { ...subtree.nodeMap[id] } as TEBaseNode);
  });

  const _root = subtree.nodeMap[subtree._tempRootId] as TEInternalNode;

  _root.children.forEach(id => {
    nodeMap.setNode(id, {
      ...(nodeMap.ensureNode(id) as any),
      parent: parentNodeId
    });
  });

  updateReference(nodeMap, parentNodeId, _root.children, referenceNodeId, to);

  return nodeMap.ensureNode(_root.children[0]) as TEBaseNode;
}

function updateReference(
  nodeMap: NodeMap,
  parentNodeId: TENodeID,
  nodeIds: TENodeID[],
  referenceNodeId: TENodeID | undefined,
  to: "after" | "before"
) {
  const parentNode = nodeMap.ensureNode(parentNodeId);

  if (!nodeMap.schema.isInternalNode(parentNode)) {
    throw new Error("parentNode must have children attribute");
  }

  if (referenceNodeId === undefined) {
    nodeMap.setNode(parentNodeId, {
      ...parentNode,
      children:
        to === "after"
          ? [...nodeIds, ...parentNode.children]
          : [...parentNode.children, ...nodeIds]
    });

    return;
  }

  const referenceNode = nodeMap.ensureNode(referenceNodeId);

  if (referenceNode.parent !== parentNodeId) {
    throw new Error("referenceNode must be child of parentNode");
  }

  const i = parentNode.children.indexOf(referenceNode.id);

  nodeMap.setNode(parentNodeId, {
    ...parentNode,
    children:
      to === "after"
        ? ImmutableArray.splice(parentNode.children, i + 1, 0, ...nodeIds)
        : ImmutableArray.splice(
            parentNode.children,
            i,
            1,
            ...nodeIds,
            referenceNode.id
          )
  });
}

function makeNewNode<T extends TEBaseNode>(
  nodeMap: NodeMap,
  attrs: Partial<T>,
  parentNodeId: TENodeID
): TEBaseNode {
  const id = attrs.id === undefined ? generateNewId() : attrs.id;

  if (nodeMap.hasNode(id)) {
    throw new Error(`New node id ${id} has already exists`);
  }

  if (!attrs.type) {
    throw new Error("node type must be specified");
  }

  const node: TEBaseNode = {
    ...attrs,
    id,
    type: attrs.type
  };

  if (nodeMap.schema.isChildNode(node)) {
    node.parent = parentNodeId;
  }

  if (nodeMap.schema.isParentNode(node)) {
    node.children = [];
  }

  return node;
}
