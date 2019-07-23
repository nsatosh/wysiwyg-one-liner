import { inspect } from "util";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { TENodeID, TENodeMap } from "../../src/core/types";
import { TestingNodeSchema } from "../TestingNodeSchema";

export function printShape(nodeMap: TENodeMap, rootId?: TENodeID): void {
  console.log(inspect(getShape(nodeMap, rootId), false, null));
}

export function getShape(nodeMap: TENodeMap, rootId?: TENodeID): any {
  if (rootId === undefined) {
    rootId = Object.keys(nodeMap).find(
      id => (nodeMap[id] as any).parent === undefined
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
  delete (cloned as any).parent;

  for (let key in cloned) {
    if ((cloned as any)[key] === undefined) {
      delete (cloned as any)[key];
    }
  }

  const nm = new NodeMap(TestingNodeSchema, nodeMap);

  if (nm.schema.isParentNode(cloned)) {
    cloned.children = cloned.children.map(id => getShape(nodeMap, id));
  }

  return cloned;
}
