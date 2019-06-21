import { DeleteFuntion } from "./NodeMap/deleteRange/deleteSubtree";
import {
  TEBaseNode,
  TEChildNode,
  TEInlineContainerNode,
  TEInternalNode,
  TELeafNode,
  TEParentNode,
  TERootNode,
  TETextNode
} from "./types";
import { BUILTIN_ITEMS } from "./BuiltinNodeSchema";

export type NodeSchemaItems = {
  type: string;
  category: "leaf" | "internal" | "root";
  isBlockNode: boolean;
  isInlineContainerNode: boolean;
  getLength: (node: TEBaseNode) => number | undefined;
  getText: (node: TEBaseNode) => string[] | undefined;
  delete?: DeleteFuntion;
  canHaveCursor: boolean;
};

export class NodeSchema {
  private nodes: { [type: string]: NodeSchemaItems };

  constructor() {
    this.nodes = {};

    BUILTIN_ITEMS.forEach(schema => {
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

  isEndNode(node: TEBaseNode): node is TETextNode {
    return node.type === "text" && !!(node as TETextNode).end;
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

  registerInternalNode(type: string, schema: Partial<NodeSchemaItems>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "internal",
      isBlockNode: schema.isBlockNode || false,
      isInlineContainerNode: schema.isInlineContainerNode || false,
      getLength: schema.getLength || (() => undefined),
      getText: schema.getText || (() => undefined),
      canHaveCursor: schema.canHaveCursor || false
    };
  }

  registerLeafNode(type: string, schema: Partial<NodeSchemaItems>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "leaf",
      isBlockNode: schema.isBlockNode || false,
      isInlineContainerNode: schema.isInlineContainerNode || false,
      getLength: schema.getLength || (() => undefined),
      getText: schema.getText || (() => undefined),
      canHaveCursor: schema.canHaveCursor || false
    };
  }
}
