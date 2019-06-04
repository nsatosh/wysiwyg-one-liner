import {
  TEBlockNode,
  TEBranchNode,
  TEInlineContainerNode,
  TELeafBlockNode,
  TELeafNode,
  TELinkNode,
  TEMathNode,
  TEMediaNode,
  TENode,
  TESentinelNode,
  TESubTree,
  TETextNode
} from "./types";

export function isBranchNode(node: TENode): node is TEBranchNode {
  return !isLeafNode(node);
}

export function isLeafNode(node: TENode): node is TELeafNode {
  return (
    node.type === "text" || node.type === "media" || node.type === "sentinel"
  );
}

export function isInlineNode(
  node: TENode
): node is TESentinelNode | TETextNode | TELinkNode | TEMediaNode | TEMathNode {
  return (
    node.type === "sentinel" ||
    node.type === "text" ||
    node.type === "link" ||
    node.type === "math" ||
    node.type === "media"
  );
}

export function isBlockNode(node: TENode): node is TEBlockNode {
  return node.type === "row";
}

export function isLeafBlockNode(node: TENode): node is TELeafBlockNode {
  return node.type === "row";
}

export function canHaveCursor(
  node: TENode
): node is TETextNode | TEMediaNode | TESentinelNode {
  return (
    node.type === "text" || node.type === "media" || node.type === "sentinel"
  );
}

export function isInlineContainerNode(
  node: TENode
): node is TEInlineContainerNode {
  return (
    node.type === "link" || node.type === "math" || node.type === "grouping"
  );
}

export function isSubTree(obj: any): obj is TESubTree {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  return (
    (obj as TESubTree).nodeMap && (obj as TESubTree)._tempRootId !== undefined
  );
}