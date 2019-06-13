import { TENode, TEBranchNode, TELeafNode } from "./types";

type NodeSchema = {
  type: string;
  category: "leaf" | "branch";
};

const BUILTIN_NODE_SCHEMAS: NodeSchema[] = [
  {
    type: "text",
    category: "leaf"
  },
  {
    type: "sentinel",
    category: "leaf"
  },
  {
    type: "media",
    category: "leaf"
  },
  {
    type: "row",
    category: "branch"
  },
  {
    type: "link",
    category: "branch"
  },
  {
    type: "math",
    category: "branch"
  },
  {
    type: "grouping",
    category: "branch"
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

  registerBranchNode(type: string, schema: Partial<NodeSchema>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "branch"
    };
  }

  registerLeafNode(type: string, schema: Partial<NodeSchema>) {
    this.nodes[type] = {
      ...schema,
      type: type,
      category: "leaf"
    };
  }
}
