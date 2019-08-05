import InlineEnd from "../component/node/InlineEnd";
import InlineText from "../component/node/InlineText";
import { ElementOffset } from "../service/getElementOffset";
import { OpenableRange, Stat } from "./NodeMap/deleteRange/deleteSubtree";
import NodeMap from "./NodeMap/NodeMap";
import { NodeSchemaItem } from "./NodeSchema";
import { Coord, TENodeID, TETextNode } from "./types";
import InlineSentinel from "../component/node/InlineSentinel";

export const SentinelNodeType = Symbol("sentinel");

export const SentinelNodeSchema: NodeSchemaItem = {
  type: SentinelNodeType,
  category: "leaf",
  isBlockNode: false,
  isInternalNode: false,
  getLength: () => 1,
  getText: () => undefined,
  delete: (
    _nodeMap: NodeMap,
    node,
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
  canHaveCursor: true,
  component: InlineSentinel
};

export const RowNodeSchema: NodeSchemaItem = {
  type: "row",
  category: "root",
  isBlockNode: true,
  isInternalNode: false,
  getLength: () => undefined,
  getText: () => undefined,
  canHaveCursor: false
};

export const EndNodeSchema: NodeSchemaItem = {
  type: "end",
  category: "leaf",
  isBlockNode: false,
  isInternalNode: false,
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
  component: InlineEnd,
  canHaveCursor: true
};

export const TextNodeSchema: NodeSchemaItem = {
  type: "text",
  category: "leaf",
  isBlockNode: false,
  isInternalNode: false,
  getLength: (node: TETextNode) => node.text.length,
  getText: (node: TETextNode) => node.text,
  textPositionToCoord: (
    el,
    node: TETextNode,
    eOffset: ElementOffset,
    ch: number,
    dummyTextEl
  ): Coord => {
    return {
      top: eOffset.top,
      left: eOffset.left + calcTextWidth(dummyTextEl, el, node, ch)
    };
  },
  coordToTextPosition: (el, node: TETextNode, coord, dummyTextEl) => {
    const mouseX = coord.left - el.getBoundingClientRect()!.left;
    let left = 0;
    let right = el.innerText.length;

    while (right - left > 1) {
      const center = Math.floor((left + right) / 2);

      if (calcTextWidth(dummyTextEl, el, node, center) < mouseX) {
        left = center;
      } else {
        right = center;
      }
    }

    const centerX =
      (calcTextWidth(dummyTextEl, el, node, left) +
        calcTextWidth(dummyTextEl, el, node, right)) /
      2;

    return {
      id: node.id,
      ch: mouseX < centerX ? left : right,
      nonCanonical: true
    };
  },
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
  component: InlineText,
  canHaveCursor: true
};

export const BUILTIN_ITEMS: NodeSchemaItem[] = [
  SentinelNodeSchema,
  RowNodeSchema,
  EndNodeSchema,
  TextNodeSchema
];

function calcTextWidth(
  dummyTextEl: HTMLElement,
  element: HTMLElement,
  node: TETextNode,
  end?: number
): number {
  dummyTextEl.style.fontSize = element.style.fontSize;
  dummyTextEl.style.fontWeight = element.style.fontWeight;
  dummyTextEl.innerText = node.text.slice(0, end).join("");

  return dummyTextEl.offsetWidth;
}
