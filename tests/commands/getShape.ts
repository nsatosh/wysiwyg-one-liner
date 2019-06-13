import { inspect } from "util";
import { NodeMap } from "../../src/core";
import { TENodeID, TENodeMap } from "../../src/core/types";

export function printShape(nodeMap: TENodeMap, rootId?: TENodeID): void {
  console.log(inspect(getShape(nodeMap, rootId), false, null));
}

export function getShape(nodeMap: TENodeMap, rootId?: TENodeID): any {
  if (rootId === undefined) {
    rootId = Object.keys(nodeMap).find(
      id => nodeMap[id]!.parent === undefined
    )!;
  }

  const node = nodeMap[rootId];

  if (!node) {
    return { ERROR: `node (${rootId}) was not found` };
  }

  const cloned = {
    type: node.type,
    ...node
  };

  delete cloned.id;
  delete cloned.parent;

  for (let key in cloned) {
    if ((cloned as any)[key] === undefined) {
      delete (cloned as any)[key];
    }
  }

  const nm = new NodeMap(nodeMap);

  if (nm.schema.isBranchNode(cloned)) {
    cloned.children = cloned.children.map(id => getShape(nodeMap, id));
  }

  return cloned;
}
