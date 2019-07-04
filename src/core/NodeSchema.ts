import * as ImmutableArray from "@immutable-array/prototype";
import { DeleteFuntion } from "./NodeMap/deleteRange/deleteSubtree";
import {
  TEBaseNode,
  TEChildNode,
  TEInlineContainerNode,
  TEInternalNode,
  TELeafNode,
  TEParentNode,
  TERootNode,
  TETextNode,
  TEEndNode,
  Coord,
  TETextPosition
} from "./types";
import { ElementOffset } from "../service/getElementOffset";

export type NodeSchemaItems = {
  type: string;
  category: "leaf" | "internal" | "root";
  isBlockNode: boolean;
  isInlineContainerNode: boolean;
  getLength: (node: TEBaseNode) => number | undefined;
  getText: (node: TEBaseNode) => string[] | undefined;
  textPositionToCoord?: (
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
  private nodes: { [type: string]: NodeSchemaItems };

  constructor(items: NodeSchemaItems[]) {
    this.nodes = {};

    items.forEach(schema => {
      this.nodes[schema.type] = schema;
    });
  }

  getNodeSchema(type: string): NodeSchemaItems | undefined {
    return this.nodes[type];
  }

  isRootNode(node: TEBaseNode): node is TERootNode {
    const schema = this.nodes[node.type];

    return schema ? schema.category === "root" : false;
  }

  isInternalNode(node: TEBaseNode): node is TEInternalNode {
    const schema = this.nodes[node.type];

    return schema ? schema.category === "internal" : false;
  }

  isLeafNode(node: TEBaseNode): node is TELeafNode {
    const schema = this.nodes[node.type];

    return schema ? schema.category === "leaf" : false;
  }

  isChildNode(node: TEBaseNode): node is TEChildNode {
    return this.isLeafNode(node) || this.isInternalNode(node);
  }

  isParentNode(node: TEBaseNode): node is TEParentNode {
    return this.isRootNode(node) || this.isInternalNode(node);
  }

  isBlockNode(node: TEBaseNode): boolean {
    const schema = this.nodes[node.type];

    return schema ? schema.isBlockNode : false;
  }

  isTextNode(node: TEBaseNode): node is TETextNode {
    return node.type === "text";
  }

  isEndNode(node: TEBaseNode): node is TEEndNode {
    return node.type === "end";
  }

  isInlineContainerNode(node: TEBaseNode): node is TEInlineContainerNode {
    const schema = this.nodes[node.type];

    return schema ? schema.isInlineContainerNode : false;
  }

  canHaveCursor(node: TEBaseNode): boolean {
    const schema = this.nodes[node.type];

    return schema ? schema.canHaveCursor : false;
  }

  getNodeLength(node: TEBaseNode): number | undefined {
    const schema = this.nodes[node.type];

    if (schema) {
      return schema.getLength(node);
    }
  }

  getText(node: TEBaseNode): string[] | undefined {
    const schema = this.nodes[node.type];

    if (schema) {
      return schema.getText(node);
    }
  }

  getDeteteFunction(node: TEBaseNode): DeleteFuntion | undefined {
    const schema = this.nodes[node.type];

    if (schema) {
      return schema.delete;
    }
  }

  getCustomNodeComponent(node: TEBaseNode): unknown | undefined {
    const schema = this.nodes[node.type];

    if (schema) {
      return schema.component;
    }
  }

  textPositionToCoord(
    node: TELeafNode,
    offset: ElementOffset,
    ch: number
  ): Coord | undefined {
    const schema = this.nodes[node.type];

    if (schema && schema.textPositionToCoord) {
      return schema.textPositionToCoord(node, offset, ch);
    }
  }

  coordToTextPosition(
    element: HTMLElement,
    node: TELeafNode,
    coord: Coord
  ): TETextPosition | undefined {
    const schema = this.nodes[node.type];

    if (schema && schema.coordToTextPosition) {
      return schema.coordToTextPosition(element, node, coord);
    }
  }

  setCustomNodeComponent(type: string, component: unknown): NodeSchema {
    const schema = this.nodes[type];

    if (!schema) {
      throw new Error("Correspond schema was not found");
    }

    const items = Object.values(this.nodes);
    const start = items.findIndex(item => item.type === schema.type);

    if (start === -1) {
      throw new Error("Unexpected condition");
    }

    return new NodeSchema(
      ImmutableArray.splice(items, start, 1, {
        ...schema,
        component
      })
    );
  }
}
