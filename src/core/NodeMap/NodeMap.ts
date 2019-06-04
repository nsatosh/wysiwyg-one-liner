import {
  TENodeMap,
  TENodeID,
  TENode,
  TENodeMapLog,
  TENodeStyleName,
  TEMediaNode,
  TESubTree,
  TETextStyles,
  TERawNodeMap
} from "../types";
import { ensureExists } from "../ensureExists";
import { validateNodeMap } from "../validateNodeMap";
import { isBranchNode } from "../nodeTypeGuards";
import deleteNode from "./deleteNode";
import { insertNode } from "./insertNode";
import { generateNewId } from "../nodeIdGenerator";
import { moveChildren, moveExistingNode, flattenChildren } from "./moveNode";
import {
  convertRawNodeMapToNodeMap,
  convertNodeMapToRawNodeMap
} from "../Document";

export default class NodeMap {
  private source: TENodeMap | undefined;
  private mutable: TENodeMap | undefined;
  private isSubtree: boolean;
  private nodeMapLogs: TENodeMapLog[];

  constructor(source: TENodeMap, isSubtree: boolean = false) {
    this.source = source;
    this.isSubtree = isSubtree;
    this.nodeMapLogs = [];
  }

  static fromRawNodeMap(raw: TERawNodeMap): NodeMap {
    return new NodeMap(convertRawNodeMapToNodeMap(raw));
  }

  toRawNodeMap(): TERawNodeMap {
    return convertNodeMapToRawNodeMap(this.getCurrentState());
  }

  getValidCurrentState(): TENodeMap {
    if (this.mutable && process.env.NODE_ENV !== "production") {
      validateNodeMap(this.mutable, this.isSubtree);
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

  ensureNode(nodeId: TENodeID): TENode {
    return ensureExists(this.getMutableNodeMap()[nodeId]);
  }

  getNode(nodeId: TENodeID): TENode | undefined {
    return this.getMutableNodeMap()[nodeId];
  }

  hasNode(nodeId: TENodeID): boolean {
    return !!this.getMutableNodeMap()[nodeId];
  }

  forEach(callback: (node: TENode) => boolean | void): void {
    const nodeMap = this.getMutableNodeMap();

    for (let id in nodeMap) {
      if (callback(nodeMap[id] as TENode)) {
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

  appendChild(parentNodeId: TENodeID, attrs: Partial<TENode> | TESubTree) {
    return insertNode(this, parentNodeId, attrs, undefined, "before");
  }

  unshiftChild(parentNodeId: TENodeID, attrs: Partial<TENode> | TESubTree) {
    return insertNode(this, parentNodeId, attrs, undefined, "after");
  }

  insertBefore(
    parentNodeId: TENodeID,
    attrs: Partial<TENode> | TESubTree,
    referenceNodeId?: TENodeID
  ) {
    return insertNode(this, parentNodeId, attrs, referenceNodeId, "before");
  }

  insertAfter(
    parentNodeId: TENodeID,
    attrs: Partial<TENode> | TESubTree,
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

  flattenChildren(nodeId: TENodeID): void {
    return flattenChildren(this, nodeId);
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

  updateFolded(id: TENodeID, folded: boolean): void {
    return this.updateAttributes(id, "section", { folded });
  }

  updateText(id: TENodeID, text: string[]): void {
    return this.updateAttributes(id, "text", { text });
  }

  updateTextStyles(id: TENodeID, style: TETextStyles): void {
    const node = this.ensureNode(id);

    if (node.type === "text" && !node.end) {
      this.setNode(node.id, {
        ...node,
        style
      });
    }
  }

  updateStyle(id: TENodeID, styleName: TENodeStyleName): void {
    const node = this.ensureNode(id);

    if (node.type === "text" && !node.end) {
      this.setNode(node.id, {
        ...node,
        style: {
          ...node.style,
          [styleName]: !node.style[styleName]
        }
      });
    }
  }

  updateHeaderStyle(id: TENodeID, style: "section" | "list"): void {
    return this.updateAttributes(id, "header", { style });
  }

  updateUrl(id: TENodeID, url: string): void {
    return this.updateAttributes(id, "link", { url });
  }

  updateMedia(id: TENodeID, attrs: Partial<TEMediaNode>): void {
    return this.updateAttributes(id, "media", attrs);
  }

  setNode(nodeId: TENodeID, node: TENode): void {
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
        if (!node.parent) {
          rootId = node.id;
          return true;
        }
      });
    }

    if (rootId === undefined) {
      throw new Error("root node not found");
    }

    return asTree(this.getMutableNodeMap(), rootId);
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

export function asTree(nodeMap: TENodeMap, rootId: TENodeID): any {
  const node = nodeMap[rootId];

  if (!node) {
    return { ERROR: `node (${rootId}) was not found` };
  }

  const cloned = {
    id: node.id,
    parent: node.parent,
    type: node.type,
    ...node
  };

  if (isBranchNode(cloned)) {
    cloned.children = cloned.children.map(id => asTree(nodeMap, id));
  }

  return cloned;
}