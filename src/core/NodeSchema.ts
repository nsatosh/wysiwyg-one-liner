import { DeleteFuntion } from "./NodeMap/deleteRange/deleteSubtree";
import {
  TEBaseNode,
  TEChildNode,
  TEInternalNode,
  TELeafNode,
  TEParentNode,
  TERootNode,
  TETextNode,
  TEEndNode,
  Coord,
  TETextPosition,
  TENodeType
} from "./types";
import { ElementOffset } from "../service/getElementOffset";

export type NodeSchemaItem = {
  type: TENodeType;
  category: "leaf" | "internal" | "root";
  isBlockNode: boolean;
  isInternalNode: boolean;
  getLength: (node: TEBaseNode) => number | undefined;
  getText: (node: TEBaseNode) => string[] | undefined;
  textPositionToCoord?: (
    element: HTMLElement,
    node: TEBaseNode,
    eOffset: ElementOffset,
    ch: number
  ) => Coord;
  coordToTextPosition?: (
    element: HTMLElement,
    node: TEBaseNode,
    coord: Coord
  ) => TETextPosition;
  delete?: DeleteFuntion;
  component?: unknown;
  canHaveCursor: boolean;
};

export class NodeSchema {
  private nodes: { [type: string]: NodeSchemaItem };

  constructor(items: NodeSchemaItem[]) {
    this.nodes = {};

    items.forEach(schema => {
      if (typeof schema.type === "symbol") {
        this.nodes[schema.type as any] = schema;
      } else {
        this.nodes[schema.type] = schema;
      }
    });
  }

  isRootNode(node: TEBaseNode): node is TERootNode {
    const schema = this.getNodeSchema(node.type);

    return schema ? schema.category === "root" : false;
  }

  isInternalNode(node: TEBaseNode): node is TEInternalNode {
    const schema = this.getNodeSchema(node.type);

    return schema ? schema.category === "internal" : false;
  }

  isLeafNode(node: TEBaseNode): node is TELeafNode {
    const schema = this.getNodeSchema(node.type);

    return schema ? schema.category === "leaf" : false;
  }

  isChildNode(node: TEBaseNode): node is TEChildNode {
    return this.isLeafNode(node) || this.isInternalNode(node);
  }

  isParentNode(node: TEBaseNode): node is TEParentNode {
    return this.isRootNode(node) || this.isInternalNode(node);
  }

  isBlockNode(node: TEBaseNode): boolean {
    const schema = this.getNodeSchema(node.type);

    return schema ? schema.isBlockNode : false;
  }

  isTextNode(node: TEBaseNode): node is TETextNode {
    return node.type === "text";
  }

  isEndNode(node: TEBaseNode): node is TEEndNode {
    return node.type === "end";
  }

  canHaveCursor(node: TEBaseNode): boolean {
    const schema = this.getNodeSchema(node.type);

    return schema ? schema.canHaveCursor : false;
  }

  getNodeLength(node: TEBaseNode): number | undefined {
    const schema = this.getNodeSchema(node.type);

    if (schema) {
      return schema.getLength(node);
    }
  }

  getText(node: TEBaseNode): string[] | undefined {
    const schema = this.getNodeSchema(node.type);

    if (schema) {
      return schema.getText(node);
    }
  }

  getDeteteFunction(node: TEBaseNode): DeleteFuntion | undefined {
    const schema = this.getNodeSchema(node.type);

    if (schema) {
      return schema.delete;
    }
  }

  getCustomNodeComponent(node: TEBaseNode): unknown | undefined {
    const schema = this.getNodeSchema(node.type);

    if (schema) {
      return schema.component;
    }
  }

  textPositionToCoord(
    element: HTMLElement,
    node: TEBaseNode,
    offset: ElementOffset,
    ch: number
  ): Coord | undefined {
    const schema = this.getNodeSchema(node.type);

    if (schema && schema.textPositionToCoord) {
      return schema.textPositionToCoord(element, node, offset, ch);
    }
  }

  coordToTextPosition(
    element: HTMLElement,
    node: TEBaseNode,
    coord: Coord
  ): TETextPosition | undefined {
    const schema = this.getNodeSchema(node.type);

    if (schema && schema.coordToTextPosition) {
      return schema.coordToTextPosition(element, node, coord);
    }
  }

  private getNodeSchema(type: TENodeType): NodeSchemaItem | undefined {
    if (typeof type === "symbol") {
      return this.nodes[type as any];
    } else {
      return this.nodes[type];
    }
  }
}
