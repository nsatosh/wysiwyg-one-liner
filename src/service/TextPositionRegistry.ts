import {
  TENodeID,
  TENonCanonicalTextPosition,
  TETextPosition,
  Coord,
  CoordRect,
  TEBaseNode
} from "../core";
import { getElementOffset } from "./getElementOffset";
import { NodeSchema } from "../core/NodeSchema";

interface RegistryItems {
  [id: string]: HTMLElement;
}

type LookupItem = LookupElementItem | LookupLineItem;

interface LookupElementItem {
  type: "element";
  node: TEBaseNode;
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
  private nodeSchema: NodeSchema;

  constructor(nodeSchema?: NodeSchema) {
    if (nodeSchema) {
      this.nodeSchema = nodeSchema;
    }
  }

  setDOMElements(containerEl: HTMLElement) {
    this.contaierEl = containerEl;
  }

  getCoordPoint(p: TETextPosition): Coord | undefined {
    const el = this.mapping[p.id];

    if (!el) {
      return;
    }

    const item = this.lookUpMap.get(el);

    if (!item || item.type === "line") {
      return;
    }

    const eOffset = getElementOffset(this.contaierEl, el);

    return (
      this.nodeSchema.textPositionToCoord(el, item.node, eOffset, p.ch) || {
        top: eOffset.top,
        left: eOffset.left
      }
    );
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

    if (!item || item.type === "line") {
      return;
    }

    const { node } = item;
    const eOffset = getElementOffset(this.contaierEl, el);

    let p0 = {
      top: eOffset.top,
      left: eOffset.left
    };

    if (start !== undefined) {
      const p = this.nodeSchema.textPositionToCoord(el, node, eOffset, start);

      if (p) {
        p0 = p;
      }
    }

    let p1 = {
      top: eOffset.bottom,
      left: eOffset.right
    };

    if (end !== undefined) {
      const p = this.nodeSchema.textPositionToCoord(el, node, eOffset, end);

      if (p) {
        p1 = p;
      }
    }

    return {
      top: p0.top,
      left: p0.left,
      width: p1.left - p0.left,
      height: eOffset.height
    };
  }

  getPositionFromMouseEvent(
    element: HTMLElement,
    mouseClientX: number,
    mouseClientY: number
  ): TENonCanonicalTextPosition | undefined {
    const item = this.lookUpMap.get(element);

    if (!item) {
      return;
    }

    if (item.type === "line") {
      const indexClicked =
        mouseClientX <=
        element.getBoundingClientRect()!.left + item.indentWidth;

      return {
        id: indexClicked ? item.firstNodeId : item.lastNodeId,
        ch: 0,
        nonCanonical: true
      };
    }

    const pos = this.nodeSchema.coordToTextPosition(element, item.node, {
      top: mouseClientY,
      left: mouseClientX
    });

    if (pos) {
      return { ...pos, nonCanonical: true };
    }

    return {
      id: item.node.id,
      ch: 0,
      nonCanonical: true
    };
  }

  registerElement(node: TEBaseNode, element: HTMLElement): void {
    this.mapping[node.id] = element;
    this.lookUpMap.set(element, {
      type: "element",
      node
    });
  }

  unregisterElement(nodeId: TENodeID): void {
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
}
