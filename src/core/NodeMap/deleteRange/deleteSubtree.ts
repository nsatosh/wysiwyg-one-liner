import {
  TENodeID,
  TETextRange,
  TELeafNode,
  TEParentNode,
  TEBaseNode
} from "../../types";
import NodeMap from "../NodeMap";

export enum Stat {
  before,
  opened,
  between,
  single,
  closed,
  after
}

export interface OpenableRange extends TETextRange {
  open?: "start" | "end";
}

export type DeleteFuntion = (
  nodeMap: NodeMap,
  node: TEBaseNode,
  range: OpenableRange,
  stat: Stat,
  deletables: Set<TENodeID>
) => void;

export function deleteSubtree(
  nodeMap: NodeMap,
  root: TENodeID,
  range: OpenableRange
): void {
  const deletables = new Set<TENodeID>();

  traverseInRange(nodeMap, root, range, (nodeId, stat) => {
    const node = nodeMap.ensureNode(nodeId);

    const deleteFunc = nodeMap.schema.getDeteteFunction(node);

    if (deleteFunc) {
      return deleteFunc(nodeMap, node, range, stat, deletables);
    }

    if (nodeMap.schema.isLeafNode(node)) {
      return deleteLeaf(nodeMap, node, stat);
    }

    return deleteEmptyParent(nodeMap, node as TEParentNode, deletables);
  });
}

function deleteLeaf(nodeMap: NodeMap, node: TELeafNode, stat: Stat): void {
  switch (stat) {
    case Stat.before:
    case Stat.after:
      return;
    case Stat.closed:
    case Stat.opened:
    case Stat.between:
    case Stat.single:
      nodeMap.deleteNode(node.id);
      return;
    default:
      throw new Error("Unexpected condition");
  }
}

function deleteEmptyParent(
  nodeMap: NodeMap,
  node: TEParentNode,
  deletableSentinels: Set<TENodeID>
): void {
  if (
    node.children.length === 0 ||
    hasOnlyDeletable(node, deletableSentinels)
  ) {
    nodeMap.deleteNode(node.id, true);
  }
}

function hasOnlyDeletable(
  node: TEParentNode,
  deletables: Set<TENodeID>
): boolean {
  return node.children.every(id => deletables.has(id));
}

function traverseInRange(
  nodeMap: NodeMap,
  rootNodeId: TENodeID,
  range: OpenableRange,
  callback: (nodeId: TENodeID, stat: Stat) => void
): void {
  const { start, end, open } = range;
  const startId = start.id;
  const endId = end.id;

  if (open === "start") {
    let stat = Stat.between;

    return traversePostOrder(nodeMap, rootNodeId, nodeId => {
      if (nodeId === endId) {
        stat = Stat.closed;
      } else if (stat === Stat.closed) {
        stat = Stat.after;
      }

      return callback(nodeId, stat);
    });
  }

  if (open === "end") {
    let stat = Stat.before;

    return traversePostOrder(nodeMap, rootNodeId, nodeId => {
      if (nodeId === startId) {
        stat = Stat.opened;
      } else if (stat === Stat.opened) {
        stat = Stat.between;
      }

      return callback(nodeId, stat);
    });
  }

  let stat = Stat.before;

  return traversePostOrder(nodeMap, rootNodeId, nodeId => {
    if (nodeId === startId && nodeId === endId) {
      stat = Stat.single;
    } else if (nodeId === startId) {
      stat = Stat.opened;
    } else if (nodeId === endId) {
      stat = Stat.closed;
    } else if (stat === Stat.opened) {
      stat = Stat.between;
    } else if (stat === Stat.closed || stat === Stat.single) {
      stat = Stat.after;
    }

    return callback(nodeId, stat);
  });
}

function traversePostOrder(
  nodeMap: NodeMap,
  rootNodeId: TENodeID,
  callback: (nodeId: TENodeID) => void
): void {
  const node = nodeMap.ensureNode(rootNodeId);

  if (nodeMap.schema.isInternalNode(node)) {
    node.children.forEach(id => traversePostOrder(nodeMap, id, callback));
  }

  return callback(node.id);
}
