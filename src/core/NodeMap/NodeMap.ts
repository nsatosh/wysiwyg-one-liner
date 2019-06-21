import {
  TENodeMap,
  TENodeID,
  TEBaseNode,
  TENodeMapLog,
  TESubTree,
  TEChildNode
} from "../types";
import { ensureExists } from "../ensureExists";
import { validateNodeMap } from "../validateNodeMap";
import deleteNode from "./deleteNode";
import { insertNode } from "./insertNode";
import { generateNewId } from "../nodeIdGenerator";
import { moveChildren, moveExistingNode } from "./moveNode";
import { NodeSchema } from "../NodeSchema";
import { BUILTIN_ITEMS } from "../BuiltinNodeSchema";

export type NodeMapOptions = {
  isSubtree?: boolean;
  schema?: NodeSchema;
};

export default class NodeMap {
  private source: TENodeMap | undefined;
  private mutable: TENodeMap | undefined;
  public schema: NodeSchema;
  private nodeMapLogs: TENodeMapLog[];

  constructor(source: TENodeMap, options: NodeMapOptions = {}) {
    this.source = source;
    this.schema = options.schema || new NodeSchema(BUILTIN_ITEMS);
    this.nodeMapLogs = [];
  }

  getValidCurrentState(): TENodeMap {
    if (this.mutable && process.env.NODE_ENV !== "production") {
      validateNodeMap(this);
    }

    return this.getCurrentState();
  }

  getCurrentState(): Readonly<TENodeMap> {
    if (this.mutable) {
      return this.mutable;
    }

    if (this.source) {
      return this.source;
    }

    throw new Error("mutable or source must be existed");
  }

  getNodeMapLogs(): TENodeMapLog[] {
    return this.nodeMapLogs;
  }

  ensureNode(nodeId: TENodeID): TEBaseNode {
    return ensureExists(this.getMutableNodeMap()[nodeId]);
  }

  getNode(nodeId: TENodeID): TEBaseNode | undefined {
    return this.getMutableNodeMap()[nodeId];
  }

  hasNode(nodeId: TENodeID): boolean {
    return !!this.getMutableNodeMap()[nodeId];
  }

  forEach(callback: (node: TEBaseNode) => boolean | void): void {
    const nodeMap = this.getMutableNodeMap();

    for (let id in nodeMap) {
      if (callback(nodeMap[id] as TEBaseNode)) {
        return;
      }
    }
  }

  createRootNode(rootId?: TENodeID): TENodeID {
    const id = rootId || generateNewId();

    this.setNode(id, {
      id,
      type: "row",
      children: []
    });

    return id;
  }

  appendChild<T extends TEBaseNode>(
    parentNodeId: TENodeID,
    attrs: Partial<T> | TESubTree
  ) {
    return insertNode(this, parentNodeId, attrs, undefined, "before");
  }

  unshiftChild<T extends TEBaseNode>(
    parentNodeId: TENodeID,
    attrs: Partial<T> | TESubTree
  ) {
    return insertNode(this, parentNodeId, attrs, undefined, "after");
  }

  insertBefore<T extends TEBaseNode>(
    parentNodeId: TENodeID,
    attrs: Partial<T> | TESubTree,
    referenceNodeId?: TENodeID
  ) {
    return insertNode(this, parentNodeId, attrs, referenceNodeId, "before");
  }

  insertAfter<T extends TEBaseNode>(
    parentNodeId: TENodeID,
    attrs: Partial<T> | TESubTree,
    referenceNodeId?: TENodeID
  ) {
    return insertNode(this, parentNodeId, attrs, referenceNodeId, "after");
  }

  moveChildren(
    fromId: TENodeID,
    toId: TENodeID,
    children: TENodeID[],
    beforeId?: TENodeID,
    afterId?: TENodeID
  ): void {
    return moveChildren(this, fromId, toId, children, beforeId, afterId);
  }

  moveExistingNode(
    nodeId: TENodeID,
    toParentNodeId: TENodeID,
    to: "after" | "before",
    referenceNodeId?: TENodeID
  ) {
    return moveExistingNode(this, nodeId, toParentNodeId, to, referenceNodeId);
  }

  deleteNode(nodeId: TENodeID, dontClearEmpty?: boolean): void {
    return deleteNode(this, nodeId, dontClearEmpty);
  }

  updateText(id: TENodeID, text: string[]): void {
    return this.updateAttributes(id, "text", { text });
  }

  setNode<T extends TEBaseNode>(nodeId: TENodeID, node: T): void {
    const nodeMap = this.getMutableNodeMap();
    const prev = nodeMap[nodeId];

    nodeMap[nodeId] = node;

    this.nodeMapLogs.push({
      prev,
      next: node
    });
  }

  unsetNode(nodeId: TENodeID): void {
    const prev = this.getMutableNodeMap()[nodeId];

    delete this.getMutableNodeMap()[nodeId];

    this.nodeMapLogs.push({
      prev,
      next: undefined
    });
  }

  asTree(rootNodeId?: TENodeID): any {
    let rootId = rootNodeId;

    if (rootId === undefined) {
      this.forEach(node => {
        if (this.schema.isRootNode(node)) {
          rootId = node.id;
          return true;
        }
      });
    }

    if (rootId === undefined) {
      throw new Error("root node not found");
    }

    return asTree(this, rootId);
  }

  private updateAttributes(
    id: TENodeID,
    expectedType: string,
    attrs: object
  ): void {
    const node = this.ensureNode(id);

    if (node.type !== expectedType) {
      return;
    }

    this.setNode(node.id, {
      ...node,
      ...attrs
    });
  }

  private getMutableNodeMap(): TENodeMap {
    if (this.mutable) {
      return this.mutable;
    }

    this.mutable = this.source ? { ...this.source } : {};

    return this.mutable;
  }
}

export function asTree(nodeMap: NodeMap, rootId: TENodeID): any {
  const node = nodeMap.getNode(rootId);

  if (!node) {
    return { ERROR: `node (${rootId}) was not found` };
  }

  const cloned: TEBaseNode = {
    id: node.id,
    type: node.type,
    ...node
  };

  if (nodeMap.schema.isChildNode(cloned)) {
    cloned.parent = (node as TEChildNode).parent;
  }

  if (nodeMap.schema.isInternalNode(cloned)) {
    cloned.children = cloned.children.map(id => asTree(nodeMap, id));
  }

  return cloned;
}
