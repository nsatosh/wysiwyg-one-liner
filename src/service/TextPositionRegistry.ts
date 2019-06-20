import {
  TELeafNode,
  TENodeID,
  TENonCanonicalTextPosition,
  TETextNode
} from "../core";
import { getElementOffset } from "./getElementOffset";

interface Coord {
  top: number;
  left: number;
}

interface CoordRect extends Coord {
  width: number;
  height: number;
}

interface RegistryItems {
  [id: string]: HTMLElement;
}

type LookupItem = LookupLeafItem | LookupLineItem;

interface LookupLeafItem {
  type: "leaf";
  node: TELeafNode;
}

interface LookupLineItem {
  type: "line";
  firstNodeId: TENodeID;
  lastNodeId: TENodeID;
  indentWidth: number;
}

export class TextPositionRegistry {
  private mapping = {} as RegistryItems;
  private lookUpMap = new WeakMap<HTMLElement, LookupItem>();
  private contaierEl: HTMLElement;
  private dummyTextEl: HTMLElement;

  setDOMElements(containerEl: HTMLElement, dummyTextEl: HTMLElement) {
    this.contaierEl = containerEl;
    this.dummyTextEl = dummyTextEl;
  }

  getCoordPoint(nodeId: TENodeID, index?: number): Coord | undefined {
    const el = this.mapping[nodeId];

    if (!el) {
      return;
    }

    const item = this.lookUpMap.get(el);

    if (!item || item.type !== "leaf") {
      return;
    }

    const { node } = item;
    const { top, left } = getElementOffset(this.contaierEl, el);

    if (node.type !== "text") {
      return {
        top,
        left
      };
    }

    return {
      top,
      left: left + this.calcTextWidth(el, node, index)
    };
  }

  getCoordRect(
    nodeId: TENodeID,
    start?: number,
    end?: number
  ): CoordRect | undefined {
    const el = this.mapping[nodeId];

    if (!el) {
      return;
    }

    const item = this.lookUpMap.get(el);

    if (!item || item.type !== "leaf" || item.node.type !== "text") {
      return;
    }

    const { node } = item;
    const rect = getElementOffset(this.contaierEl, el);

    if (start === undefined && end === undefined) {
      return rect;
    }

    const p0 = start ? this.calcTextWidth(el, node, start) : 0;
    const p1 = this.calcTextWidth(el, node, end);

    return {
      top: rect.top,
      left: rect.left + p0,
      width: p1 - p0,
      height: rect.height
    };
  }

  getPositionFromNodeId(
    id: TENodeID,
    mouseClientX: number
  ): TENonCanonicalTextPosition | undefined {
    const el = this.mapping[id];

    if (!el) {
      return;
    }

    return this.getPositionFromMouseEvent(el, mouseClientX);
  }

  getPositionFromMouseEvent(
    element: HTMLElement,
    mouseClientX: number
  ): TENonCanonicalTextPosition | undefined {
    const item = this.lookUpMap.get(element);

    if (!item) {
      return;
    }

    if (item.type === "line") {
      return this.getPositionFromMouseEventLine(element, mouseClientX, item);
    } else if (item.node.type === "media") {
      return this.getPositionFromMouseEventMedia(element, mouseClientX, item);
    } else if (item.node.type === "sentinel") {
      return this.getPositionFromMouseEventSentinel(item);
    } else {
      return this.getPositionFromMouseEventText(element, mouseClientX, item);
    }
  }

  private getPositionFromMouseEventLine(
    element: HTMLElement,
    mouseClientX: number,
    item: LookupLineItem
  ): TENonCanonicalTextPosition | undefined {
    const indexClicked =
      mouseClientX <= element.getBoundingClientRect()!.left + item.indentWidth;

    return {
      id: indexClicked ? item.firstNodeId : item.lastNodeId,
      ch: 0,
      nonCanonical: true
    };
  }

  private getPositionFromMouseEventMedia(
    element: HTMLElement,
    mouseClientX: number,
    item: LookupLeafItem
  ): TENonCanonicalTextPosition | undefined {
    const r = element.getBoundingClientRect();

    return {
      id: item.node.id,
      ch: mouseClientX <= (r.left + r.right) / 2 ? 0 : 1,
      nonCanonical: true
    };
  }

  private getPositionFromMouseEventSentinel(
    item: LookupLeafItem
  ): TENonCanonicalTextPosition | undefined {
    return {
      id: item.node.id,
      ch: 0,
      nonCanonical: true
    };
  }

  private getPositionFromMouseEventText(
    element: HTMLElement,
    mouseClientX: number,
    item: LookupLeafItem
  ): TENonCanonicalTextPosition | undefined {
    const node = item.node;
    const el = this.mapping[node.id];

    if (!el) {
      return;
    }

    const mouseX = mouseClientX - el.getBoundingClientRect()!.left;
    let left = 0;
    let right = el.innerText.length;

    while (right - left > 1) {
      const center = Math.floor((left + right) / 2);

      if (this.calcTextWidth(el, node, center) < mouseX) {
        left = center;
      } else {
        right = center;
      }
    }

    const centerX =
      (this.calcTextWidth(el, node, left) +
        this.calcTextWidth(el, node, right)) /
      2;

    return {
      id: item.node.id,
      ch: mouseX < centerX ? left : right,
      nonCanonical: true
    };
  }

  registerLeafElement(node: TELeafNode, element: HTMLElement): void {
    this.mapping[node.id] = element;
    this.lookUpMap.set(element, {
      type: "leaf",
      node
    });
  }

  unregisterLeafElement(nodeId: TENodeID): void {
    delete this.mapping[nodeId];
  }

  registerLineElement(
    firstNodeId: TENodeID,
    lastNodeId: TENodeID,
    element: HTMLElement,
    indentWidth: number
  ): void {
    this.lookUpMap.set(element, {
      type: "line",
      indentWidth,
      firstNodeId,
      lastNodeId
    });
  }

  private calcTextWidth(
    element: HTMLElement,
    node: TETextNode,
    end?: number
  ): number {
    const { dummyTextEl } = this;

    dummyTextEl.style.fontSize = element.style.fontSize;
    dummyTextEl.style.fontWeight = element.style.fontWeight;
    dummyTextEl.innerText = node.text.slice(0, end).join("");

    return dummyTextEl.offsetWidth;
  }
}
