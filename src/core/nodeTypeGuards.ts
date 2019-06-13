import { TEBlockNode, TEInlineContainerNode, TENode, TESubTree } from "./types";

export function isBlockNode(node: TENode): node is TEBlockNode {
  return node.type === "row";
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
