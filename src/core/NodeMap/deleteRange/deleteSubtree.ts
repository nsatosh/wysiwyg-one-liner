import { isBranchNode } from "../../nodeTypeGuards";
import {
  TEBranchNode,
  TEMediaNode,
  TENodeID,
  TETextNode,
  TETextRange,
  TESentinelNode
} from "../../types";
import NodeMap from "../NodeMap";

enum Stat {
  before,
  opened,
  between,
  single,
  closed,
  after
}

interface OpenableRange extends TETextRange {
  open?: "start" | "end";
}

export function deleteSubtree(
  nodeMap: NodeMap,
  root: TENodeID,
  range: OpenableRange
): void {
  const deletableSentinels = new Set<TENodeID>();

  traverseInRange(nodeMap, root, range, (nodeId, stat) => {
    const node = nodeMap.ensureNode(nodeId);

    if (node.type === "text") {
      return deleteOrSliceTextNode(nodeMap, node, range, stat);
    } else if (node.type === "media") {
      return deleteMediaNode(nodeMap, node, stat);
    } else if (node.type === "sentinel") {
      return deleteSentinelNode(nodeMap, node, stat, deletableSentinels);
    } else {
      return deleteEmptyParent(nodeMap, node, deletableSentinels);
    }
  });
}

function deleteOrSliceTextNode(
  nodeMap: NodeMap,
  node: TETextNode,
  range: OpenableRange,
  stat: Stat
): void {
  const startCh = range.start.ch;
  const endCh = range.end.ch;
  const { id, text } = node;

  switch (stat) {
    case Stat.before:
    case Stat.after:
      return;

    case Stat.between:
      nodeMap.deleteNode(id, true);
      return;

    case Stat.single:
      nodeMap.updateText(id, text.slice(0, startCh).concat(text.slice(endCh)));
      return;

    case Stat.opened:
      nodeMap.updateText(id, text.slice(0, startCh));
      return;

    case Stat.closed:
      nodeMap.updateText(id, text.slice(endCh));
      return;

    default:
      throw new Error("Unexpected condition");
  }
}

function deleteMediaNode(
  nodeMap: NodeMap,
  node: TEMediaNode,
  stat: Stat
): void {
  switch (stat) {
    case Stat.before:
    case Stat.after:
    case Stat.closed:
      return;
    case Stat.opened:
      nodeMap.setNode(node.id, {
        id: node.id,
        parent: node.parent,
        type: "text",
        text: [],
        style: {},
        end: false
      });
      return;
    case Stat.between:
      nodeMap.deleteNode(node.id, true);
      return;
    case Stat.single:
    default:
      throw new Error("Unexpected condition");
  }
}

function deleteSentinelNode(
  _nodeMap: NodeMap,
  node: TESentinelNode,
  stat: Stat,
  deletableSentinels: Set<TENodeID>
): void {
  switch (stat) {
    case Stat.before:
    case Stat.after:
    case Stat.closed:
    case Stat.opened:
      return;
    case Stat.between:
      deletableSentinels.add(node.id);
      return;
    case Stat.single:
    default:
      throw new Error("Unexpected condition");
  }
}

function deleteEmptyParent(
  nodeMap: NodeMap,
  node: TEBranchNode,
  deletableSentinels: Set<TENodeID>
): void {
  if (
    node.children.length === 0 ||
    hasOnlyDeletableSentinel(node, deletableSentinels)
  ) {
    nodeMap.deleteNode(node.id, true);
  }
}

function hasOnlyDeletableSentinel(
  node: TEBranchNode,
  deletableSentinels: Set<TENodeID>
): boolean {
  return node.children.every(id => deletableSentinels.has(id));
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

  if (isBranchNode(node)) {
    node.children.forEach(id => traversePostOrder(nodeMap, id, callback));
  }

  return callback(node.id);
}
