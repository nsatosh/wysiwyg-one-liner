export interface TEEditor {
  rootNodeId: TENodeID;

  documentRootNodeId: TENodeID;

  nodeMap: TENodeMap;

  cachedDocumentNodeMap?: TENodeMap;

  isActive: boolean;

  searchText?: string;

  cursorAt: TETextPosition | null;

  selection: TETextSelection | null;

  compositionRange?: TETextRange;

  compositionFocusedRange?: TETextRange;

  commandHistory: TECommandHistory;

  inComposition?: boolean;

  mode: TEMode;

  keybindSettings?: TEKeybindSettings;

  showConfig?: boolean;

  inDebug?: boolean;
}

export interface TEKeybindSettings {
  [key: string]: string;
}

export type TEMode = "plain" | "wysiwyg";

export interface TECommandHistory {
  past: TECommandHistoryItem[];

  future: TECommandHistoryItem[];
}

export interface TECommandHistoryItem {
  name: string;

  mutatorLogs: TEMutatorLog[];

  inComposition?: boolean;
}

export type TEMutatorLog =
  | TEMutatorLogUpdateCursorAt
  | TEMutatorLogUpdateSelection
  | TEMutatorLogUpdateRootNodeId
  | TEMutatorLogUpdateNodeMap;

export interface TEMutatorLogUpdateNodeMap {
  name: "updateNodeMap";

  nodeMapLogs: TENodeMapLog[];
}

export interface TEMutatorLogUpdateRootNodeId {
  name: "updateRootNodeId";

  prev: TENodeID;

  next: TENodeID;
}

export interface TEMutatorLogUpdateCursorAt {
  name: "updateCursorAt";

  prev: TETextPosition | null;

  next: TETextPosition | null;
}

export interface TEMutatorLogUpdateSelection {
  name: "updateSelection";

  prev: TETextSelection | null;

  next: TETextSelection | null;
}

export interface TENodeMapLog {
  prev: TEBaseNode | undefined;

  next: TEBaseNode | undefined;
}

export type TENodeID = string;

export type TENodeMap = { [id: string]: TEBaseNode | undefined };

export enum TEDirection {
  up,
  down,
  left,
  right
}

export interface TETextPosition {
  id: TENodeID;

  ch: number;
}

export interface TENonCanonicalTextPosition extends TETextPosition {
  nonCanonical: true;
}

export interface TETextRange {
  start: TETextPosition;

  end: TETextPosition;
}

export interface TETextSelection extends TETextRange {
  focus: "start" | "end";
}

export type TENodeStyleName = "bold" | "italic" | "underline" | "strikethrough";

export type TETextStyles = { [name in TENodeStyleName]?: boolean };

export type TEBlockNode = TERowNode;
export type TELeafBlockNode = TERowNode;

export type TENodeType =
  | "text"
  | "sentinel"
  | "row"
  | "link"
  | "media"
  | "grouping"
  | "math";

export interface TEBaseNode {
  type: TENodeType;

  id: TENodeID;
}

export interface TEInternalNode extends TEBaseNode {
  parent: TENodeID;

  children: TENodeID[];
}

export interface TELeafNode extends TEBaseNode {
  parent: TENodeID;
}

export interface TEInlineContainerNode extends TEBaseNode {
  parent: TENodeID;

  children: TENodeID[];
}

export interface TESentinelNode extends TEBaseNode {
  type: "sentinel";

  parent: TENodeID;
}

export interface TETextNode extends TEBaseNode {
  type: "text";

  text: string[];

  style: TETextStyles;

  parent: TENodeID;

  end?: boolean;
}

export interface TERowNode extends TEBaseNode {
  type: "row";

  children: TENodeID[];

  parent?: TENodeID;
}

/**
 * Inline node that has any other inline nodes as children.
 *
 * This node must have parent such as row node or other grouping node.
 */
export interface TEGroupingNode extends TEBaseNode {
  type: "grouping";

  children: TENodeID[];

  parent: TENodeID;
}

export interface TELinkNode extends TEBaseNode {
  type: "link";

  children: TENodeID[];

  url: string;

  parent: TENodeID;
}

export interface TEMediaNode extends TEBaseNode {
  type: "media";

  url: string;

  parent: TENodeID;

  size: TEMediaSize;
}

export interface TEMediaSize {
  width: number;
  height: number;
}

export interface TEMathNode extends TEBaseNode {
  type: "math";

  children: TENodeID[];

  parent: TENodeID;
}

export interface TESubTree {
  nodeMap: TENodeMap;

  _tempRootId: TENodeID;
}
