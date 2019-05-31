import { getParentNode } from "../nodeFinders";
import { TENode, TENodeID } from "../types";
import NodeMap from "./NodeMap";

export function getFullPath(nodeMap: NodeMap, startFrom: TENodeID): TENodeID[] {
  const path = [] as TENodeID[];
  let node: TENode | undefined = nodeMap.ensureNode(startFrom);

  while (node) {
    path.push(node.id);
    node = getParentNode(nodeMap, node);
  }

  return path;
}
