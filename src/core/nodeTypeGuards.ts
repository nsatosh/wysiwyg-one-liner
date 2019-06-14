import { TESubTree } from "./types";

export function isSubTree(obj: any): obj is TESubTree {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  return (
    (obj as TESubTree).nodeMap && (obj as TESubTree)._tempRootId !== undefined
  );
}
