import {
  TEInternalNode,
  TELeafNode,
  TEInlineContainerNode,
  TEBaseNode,
  TETextNode,
  TERootNode
} from "./types";

type NodeSchema = {
  type: string;
  category: "leaf" | "internal" | "root";
  isBlockNode: boolean;
  isInlineContainerNode: boolean;
  getLength: (node: TEBaseNode) => number | undefined;
  canHaveCursor: boolean;
};

const BUILTIN_NODE_SCHEMAS: NodeSchema[] = [
  {
    type: "row",
    category: "root",
    isBlockNode: true,
    isInlineContainerNode: false,
    getLength: () => undefined,
    canHaveCursor: false
  },
  {
    type: "text",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    getLength: (node: TETextNode) => {
      if (node.end) {
        return 1;
      } else {
        return node.text.length;
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
    canHaveCursor: true
  },
  {
    type: "media",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    getLength: () => 1,
    canHaveCursor: true
  },
  {
    type: "link",
    category: "internal",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    canHaveCursor: false
  },
  {
    type: "math",
    category: "internal",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    canHaveCursor: false
  },
  {
    type: "grouping",
    category: "internal",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    canHaveCursor: false
  }
];

export class NodeMapSchema {
  private nodes: { [type: string]: NodeSchema };

  constructor() {
    this.nodes = {};

    BUILTIN_NODE_SCHEMAS.forEach(schema => {
      this.nodes[schema.type] = schema;
    });
  }

  getNodeSchema(type: string): NodeSchema | undefined {
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

  isBlockNode(node: TEBaseNode): boolean {
    const schema = this.nodes[node.type];

    return schema ? schema.isBlockNode : false;
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

  registerInternalNode(type: string, schema: Partial<NodeSchema>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "internal",
      isBlockNode: schema.isBlockNode || false,
      isInlineContainerNode: schema.isInlineContainerNode || false,
      getLength: schema.getLength || (() => undefined),
      canHaveCursor: schema.canHaveCursor || false
    };
  }

  registerLeafNode(type: string, schema: Partial<NodeSchema>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "leaf",
      isBlockNode: schema.isBlockNode || false,
      isInlineContainerNode: schema.isInlineContainerNode || false,
      getLength: schema.getLength || (() => undefined),
      canHaveCursor: schema.canHaveCursor || false
    };
  }
}
