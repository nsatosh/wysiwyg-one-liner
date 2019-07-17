import { NodeMap } from ".";
import { OpenableRange, Stat } from "./NodeMap/deleteRange/deleteSubtree";
import { TENodeID, TETextNode, Coord } from "./types";
import { NodeSchemaItem } from "./NodeSchema";
import InlineEnd from "../component/node/InlineEnd";
import { ElementOffset } from "../service/getElementOffset";
import InlineText from "../component/node/InlineText";

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
  canHaveCursor: true
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
    ch: number
  ): Coord => {
    return {
      top: eOffset.top,
      left: eOffset.left + calcTextWidth(el, node, ch)
    };
  },
  coordToTextPosition: (el, node: TETextNode, coord) => {
    const mouseX = coord.left - el.getBoundingClientRect()!.left;
    let left = 0;
    let right = el.innerText.length;

    while (right - left > 1) {
      const center = Math.floor((left + right) / 2);

      if (calcTextWidth(el, node, center) < mouseX) {
        left = center;
      } else {
        right = center;
      }
    }

    const centerX =
      (calcTextWidth(el, node, left) + calcTextWidth(el, node, right)) / 2;

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
  element: HTMLElement,
  node: TETextNode,
  end?: number
): number {
  const dummyTextEl = getDummyTextElement();

  dummyTextEl.style.fontSize = element.style.fontSize;
  dummyTextEl.style.fontWeight = element.style.fontWeight;
  dummyTextEl.innerText = node.text.slice(0, end).join("");

  return dummyTextEl.offsetWidth;
}

let _dummyTextElement: HTMLElement | undefined;

function getDummyTextElement() {
  if (_dummyTextElement) {
    return _dummyTextElement;
  }

  const el = window.document.createElement("span");
  window.document.body.appendChild(el);

  _dummyTextElement = el;

  return _dummyTextElement;
}
