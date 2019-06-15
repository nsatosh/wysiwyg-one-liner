import {
  TEBranchNode,
  TELeafNode,
  TENode,
  TEInlineContainerNode,
  TEBaseNode,
  TETextNode
} from "./types";

type NodeSchema = {
  type: string;
  category: "leaf" | "branch";
  isBlockNode: boolean;
  isInlineContainerNode: boolean;
  getLength: (node: TENode) => number | undefined;
  canHaveCursor: boolean;
};

const BUILTIN_NODE_SCHEMAS: NodeSchema[] = [
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
    type: "row",
    category: "branch",
    isBlockNode: true,
    isInlineContainerNode: false,
    getLength: () => undefined,
    canHaveCursor: false
  },
  {
    type: "link",
    category: "branch",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    canHaveCursor: false
  },
  {
    type: "math",
    category: "branch",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    canHaveCursor: false
  },
  {
    type: "grouping",
    category: "branch",
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

  isBranchNode(node: TENode): node is TEBranchNode {
    const schema = this.nodes[node.type];

    return schema ? schema.category === "branch" : false;
  }

  isLeafNode(node: TENode): node is TELeafNode {
    const schema = this.nodes[node.type];

    return schema ? schema.category === "leaf" : false;
  }

  isBlockNode(node: TENode): boolean {
    const schema = this.nodes[node.type];

    return schema ? schema.isBlockNode : false;
  }

  isInlineContainerNode(node: TEBaseNode): node is TEInlineContainerNode {
    const schema = this.nodes[node.type];

    return schema ? schema.isInlineContainerNode : false;
  }

  canHaveCursor(node: TENode): boolean {
    const schema = this.nodes[node.type];

    return schema ? schema.canHaveCursor : false;
  }

  getNodeLength(node: TENode): number | undefined {
    const schema = this.nodes[node.type];

    if (schema) {
      return schema.getLength(node);
    }
  }

  registerBranchNode(type: string, schema: Partial<NodeSchema>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "branch",
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
