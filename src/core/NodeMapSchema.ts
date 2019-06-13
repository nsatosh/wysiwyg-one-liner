import { TENode, TEBranchNode, TELeafNode } from "./types";

type NodeSchema = {
  type: string;
  category: "leaf" | "branch";
  canHaveCursor: boolean;
};

const BUILTIN_NODE_SCHEMAS: NodeSchema[] = [
  {
    type: "text",
    category: "leaf",
    canHaveCursor: true
  },
  {
    type: "sentinel",
    category: "leaf",
    canHaveCursor: true
  },
  {
    type: "media",
    category: "leaf",
    canHaveCursor: true
  },
  {
    type: "row",
    category: "branch",
    canHaveCursor: false
  },
  {
    type: "link",
    category: "branch",
    canHaveCursor: false
  },
  {
    type: "math",
    category: "branch",
    canHaveCursor: false
  },
  {
    type: "grouping",
    category: "branch",
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

  canHaveCursor(node: TENode): boolean {
    const schema = this.nodes[node.type];

    return schema ? schema.canHaveCursor : false;
  }

  registerBranchNode(type: string, schema: Partial<NodeSchema>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "branch",
      canHaveCursor: schema.canHaveCursor || false
    };
  }

  registerLeafNode(type: string, schema: Partial<NodeSchema>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "leaf",
      canHaveCursor: schema.canHaveCursor || false
    };
  }
}
