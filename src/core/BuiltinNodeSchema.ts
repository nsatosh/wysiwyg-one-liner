import { NodeMap } from ".";
import { OpenableRange, Stat } from "./NodeMap/deleteRange/deleteSubtree";
import {
  TEMediaNode,
  TENodeID,
  TESentinelNode,
  TETextNode,
  Coord
} from "./types";
import { NodeSchemaItems } from "./NodeSchema";
import InlineEnd from "../component/node/InlineEnd";
import { ElementOffset } from "../service/getElementOffset";
import InlineText from "../component/node/InlineText";

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
    component: InlineEnd,
    canHaveCursor: true
  },
  {
    type: "text",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
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
    coordToTextPosition: (element, node, coord) => {
      const r = element.getBoundingClientRect();

      return {
        id: node.id,
        ch: coord.left <= (r.left + r.right) / 2 ? 0 : 1,
        nonCanonical: true
      };
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
