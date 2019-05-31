import * as ImmutableArray from "@immutable-array/prototype";
import { TENodeID, TENode, TESubTree, TEBranchNode } from "../types";
import NodeMap from "./NodeMap";
import { isBranchNode, isSubTree } from "../nodeTypeGuards";
import { generateNewId } from "../nodeIdGenerator";

export function insertNode(
  nodeMap: NodeMap,
  parentNodeId: TENodeID,
  attrs: Partial<TENode> | TESubTree,
  referenceNodeId: TENodeID | undefined,
  to: "after" | "before"
): Readonly<TENode> {
  if (isSubTree(attrs)) {
    return insertSubTree(nodeMap, parentNodeId, attrs, referenceNodeId, to);
  }

  const parentNode = nodeMap.ensureNode(parentNodeId);

  if (!isBranchNode(parentNode)) {
    throw new Error("parentNode must have children attribute");
  }

  const node = makeNewNode(nodeMap, attrs, parentNodeId);

  nodeMap.setNode(node.id, node);

  updateReference(nodeMap, parentNodeId, [node.id], referenceNodeId, to);

  return node;
}

function insertSubTree(
  nodeMap: NodeMap,
  parentNodeId: TENodeID,
  subtree: TESubTree,
  referenceNodeId: TENodeID | undefined,
  to: "after" | "before"
): Readonly<TENode> {
  Object.keys(subtree.nodeMap).forEach(id => {
    if (id === subtree._tempRootId) {
      return;
    }

    nodeMap.setNode(id, { ...subtree.nodeMap[id] } as TENode);
  });

  const _root = subtree.nodeMap[subtree._tempRootId] as TEBranchNode;

  _root.children.forEach(id => {
    nodeMap.setNode(id, {
      ...(nodeMap.ensureNode(id) as any),
      parent: parentNodeId
    });
  });

  updateReference(nodeMap, parentNodeId, _root.children, referenceNodeId, to);

  return nodeMap.ensureNode(_root.children[0]) as TENode;
}

function updateReference(
  nodeMap: NodeMap,
  parentNodeId: TENodeID,
  nodeIds: TENodeID[],
  referenceNodeId: TENodeID | undefined,
  to: "after" | "before"
) {
  const parentNode = nodeMap.ensureNode(parentNodeId);

  if (!isBranchNode(parentNode)) {
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

function makeNewNode(
  nodeMap: NodeMap,
  attrs: Partial<TENode>,
  parentNodeId: TENodeID
): TENode {
  const id = attrs.id === undefined ? generateNewId() : attrs.id;

  if (nodeMap.hasNode(id)) {
    throw new Error(`New node id ${id} has already exists`);
  }

  if (!attrs.type) {
    throw new Error("node type must be specified");
  }

  switch (attrs.type) {
    case "link":
      return {
        id,
        type: "link",
        children: [],
        url: attrs.url || "",
        parent: parentNodeId
      };

    case "media":
      return {
        id,
        type: "media",
        url: attrs.url || "",
        size: attrs.size || { width: 0, height: 0 },
        parent: parentNodeId
      };

    case "row":
      return {
        id,
        type: "row",
        children: [],
        parent: parentNodeId
      };

    case "text":
      return {
        id,
        type: "text",
        text: attrs.text || [],
        parent: parentNodeId,
        style: attrs.style || {},
        end: attrs.end
      };

    case "sentinel":
      return {
        id,
        type: "sentinel",
        parent: parentNodeId
      };

    case "math":
      return {
        id,
        type: "math",
        parent: parentNodeId,
        children: []
      };

    default:
      throw new Error(`Unsupported node type ${(attrs as any).type}`);
  }
}
