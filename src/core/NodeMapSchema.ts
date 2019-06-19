import {
  TEInternalNode,
  TELeafNode,
  TEInlineContainerNode,
  TEBaseNode,
  TETextNode,
  TERootNode,
  TEChildNode,
  TEParentNode,
  TEMediaNode,
  TESentinelNode,
  TENodeID
} from "./types";
import { NodeMap } from ".";
import {
  Stat,
  OpenableRange,
  DeleteFuntion
} from "./NodeMap/deleteRange/deleteSubtree";

type NodeSchema = {
  type: string;
  category: "leaf" | "internal" | "root";
  isBlockNode: boolean;
  isInlineContainerNode: boolean;
  getLength: (node: TEBaseNode) => number | undefined;
  getText: (node: TEBaseNode) => string[] | undefined;
  delete?: DeleteFuntion;
  canHaveCursor: boolean;
};

const BUILTIN_NODE_SCHEMAS: NodeSchema[] = [
  {
    type: "row",
    category: "root",
    isBlockNode: true,
    isInlineContainerNode: false,
    getLength: () => undefined,
    getText: () => undefined,
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
    getText: (node: TETextNode) => node.text,
    delete: (
      nodeMap: NodeMap,
      node: TETextNode,
      range: OpenableRange,
      stat: Stat
    ) => {
      const startCh = range.start.ch;
      const endCh = range.end.ch;
      const { id, text } = node;

      switch (stat) {
        case Stat.before:
        case Stat.after:
          return;

        case Stat.between:
          nodeMap.deleteNode(id, true);
          return;

        case Stat.single:
          nodeMap.updateText(
            id,
            text.slice(0, startCh).concat(text.slice(endCh))
          );
          return;

        case Stat.opened:
          nodeMap.updateText(id, text.slice(0, startCh));
          return;

        case Stat.closed:
          nodeMap.updateText(id, text.slice(endCh));
          return;

        default:
          throw new Error("Unexpected condition");
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
    getText: () => undefined,
    delete: (
      _nodeMap: NodeMap,
      node: TESentinelNode,
      _range,
      stat: Stat,
      deletables: Set<TENodeID>
    ): void => {
      switch (stat) {
        case Stat.before:
        case Stat.after:
        case Stat.closed:
        case Stat.opened:
          return;
        case Stat.between:
          deletables.add(node.id);
          return;
        case Stat.single:
        default:
          throw new Error("Unexpected condition");
      }
    },
    canHaveCursor: true
  },
  {
    type: "media",
    category: "leaf",
    isBlockNode: false,
    isInlineContainerNode: false,
    getLength: () => 1,
    getText: () => undefined,
    delete: (nodeMap: NodeMap, node: TEMediaNode, _range, stat: Stat): void => {
      switch (stat) {
        case Stat.before:
        case Stat.after:
        case Stat.closed:
          return;
        case Stat.opened:
          nodeMap.setNode(node.id, {
            id: node.id,
            parent: node.parent,
            type: "text",
            text: [],
            style: {},
            end: false
          });
          return;
        case Stat.between:
          nodeMap.deleteNode(node.id, true);
          return;
        case Stat.single:
        default:
          throw new Error("Unexpected condition");
      }
    },
    canHaveCursor: true
  },
  {
    type: "link",
    category: "internal",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    getText: () => undefined,
    canHaveCursor: false
  },
  {
    type: "math",
    category: "internal",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    getText: () => undefined,
    canHaveCursor: false
  },
  {
    type: "grouping",
    category: "internal",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    getText: () => undefined,
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

  registerInternalNode(type: string, schema: Partial<NodeSchema>) {
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

  registerLeafNode(type: string, schema: Partial<NodeSchema>) {
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
