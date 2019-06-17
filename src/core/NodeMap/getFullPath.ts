import { getParentNode } from "../nodeFinders";
import { TEBaseNode, TENodeID } from "../types";
import NodeMap from "./NodeMap";

export function getFullPath(nodeMap: NodeMap, startFrom: TENodeID): TENodeID[] {
  const path = [] as TENodeID[];
  let node: TEBaseNode | undefined = nodeMap.ensureNode(startFrom);

  while (node) {
    path.push(node.id);
    node = getParentNode(nodeMap, node);
  }

  return path;
}
