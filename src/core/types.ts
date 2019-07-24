import { NodeSchema } from "./NodeSchema";
import EditorCommand from "./EditorCommand";

export interface TEEditor {
  nodeSchema: NodeSchema;

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

  commands: TECommands;

  keybindSettings?: TEKeybindSettings;

  showConfig?: boolean;

  inDebug?: boolean;
}

export interface TECommands {
  [name: string]: EditorCommand;
}

export interface TEKeybindSettings {
  [key: string]: string;
}

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

export type TENodeType = string | symbol;

export interface TEBaseNode {
  type: TENodeType;

  id: TENodeID;
}

export interface TERootNode extends TEBaseNode {
  children: TENodeID[];
}

export interface TEInternalNode extends TEBaseNode {
  parent: TENodeID;

  children: TENodeID[];
}

export interface TELeafNode extends TEBaseNode {
  parent: TENodeID;
}

export type TEParentNode = TERootNode | TEInternalNode;
export type TEChildNode = TELeafNode | TEInternalNode;

export interface TETextNode extends TEBaseNode {
  text: string[];
}

export interface TEEndNode extends TEBaseNode {
  type: "end";
}

export interface TESubTree {
  nodeMap: TENodeMap;

  _tempRootId: TENodeID;
}

export interface Coord {
  top: number;
  left: number;
}

export interface CoordRect extends Coord {
  width: number;
  height: number;
}
