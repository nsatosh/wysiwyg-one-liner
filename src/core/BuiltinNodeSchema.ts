import { NodeMap } from ".";
import { OpenableRange, Stat } from "./NodeMap/deleteRange/deleteSubtree";
import { TEMediaNode, TENodeID, TESentinelNode, TETextNode } from "./types";
import { NodeSchemaItems } from "./NodeSchema";

export const BUILTIN_ITEMS: NodeSchemaItems[] = [
  {
    type: "row",
    category: "root",
    isBlockNode: true,
    isInlineContainerNode: false,
    getLength: () => undefined,
    getText: () => undefined,
    canHaveCursor: false
  },
  {
    type: "end",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    getLength: () => 1,
    getText: () => undefined,
    delete: (
      nodeMap: NodeMap,
      node: TETextNode,
      _range: OpenableRange,
      stat: Stat
    ) => {
      switch (stat) {
        case Stat.before:
        case Stat.after:
        case Stat.closed:
        case Stat.opened:
          return;
        case Stat.between:
          nodeMap.deleteNode(node.id, true);
          return;
        case Stat.single:
        default:
          throw new Error("Unexpected condition");
      }
    },
    canHaveCursor: true
  },
  {
    type: "text",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    getLength: (node: TETextNode) => node.text.length,
    getText: (node: TETextNode) => node.text,
    delete: (
      nodeMap: NodeMap,
      node: TETextNode,
      range: OpenableRange,
      stat: Stat
    ) => {
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
          nodeMap.updateText(
            id,
            text.slice(0, startCh).concat(text.slice(endCh))
          );
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
    },
    canHaveCursor: true
  },
  {
    type: "sentinel",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    getLength: () => 1,
    getText: () => undefined,
    delete: (
      _nodeMap: NodeMap,
      node: TESentinelNode,
      _range,
      stat: Stat,
      deletables: Set<TENodeID>
    ): void => {
      switch (stat) {
        case Stat.before:
        case Stat.after:
        case Stat.closed:
        case Stat.opened:
          return;
        case Stat.between:
          deletables.add(node.id);
          return;
        case Stat.single:
        default:
          throw new Error("Unexpected condition");
      }
    },
    canHaveCursor: true
  },
  {
    type: "media",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    getLength: () => 1,
    getText: () => undefined,
    delete: (nodeMap: NodeMap, node: TEMediaNode, _range, stat: Stat): void => {
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
    },
    canHaveCursor: true
  },
  {
    type: "math",
    category: "internal",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    getText: () => undefined,
    canHaveCursor: false
  }
];
