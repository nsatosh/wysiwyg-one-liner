import { TEBranchNode, TELeafNode, TENode } from "./types";

type NodeSchema = {
  type: string;
  category: "leaf" | "branch";
  isBlockNode: boolean;
  isInlineContainerNode: boolean;
  canHaveCursor: boolean;
};

const BUILTIN_NODE_SCHEMAS: NodeSchema[] = [
  {
    type: "text",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    canHaveCursor: true
  },
  {
    type: "sentinel",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    canHaveCursor: true
  },
  {
    type: "media",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    canHaveCursor: true
  },
  {
    type: "row",
    category: "branch",
    isBlockNode: true,
    isInlineContainerNode: false,
    canHaveCursor: false
  },
  {
    type: "link",
    category: "branch",
    isBlockNode: false,
    isInlineContainerNode: true,
    canHaveCursor: false
  },
  {
    type: "math",
    category: "branch",
    isBlockNode: false,
    isInlineContainerNode: true,
    canHaveCursor: false
  },
  {
    type: "grouping",
    category: "branch",
    isBlockNode: false,
    isInlineContainerNode: true,
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

  isInlineContainerNode(node: TENode): boolean {
    const schema = this.nodes[node.type];

    return schema ? schema.isInlineContainerNode : false;
  }

  canHaveCursor(node: TENode): boolean {
    const schema = this.nodes[node.type];

    return schema ? schema.canHaveCursor : false;
  }

  registerBranchNode(type: string, schema: Partial<NodeSchema>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "branch",
      isBlockNode: schema.isBlockNode || false,
      isInlineContainerNode: schema.isInlineContainerNode || false,
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
      canHaveCursor: schema.canHaveCursor || false
    };
  }
}
