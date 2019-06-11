import NodeMap from "./NodeMap/NodeMap";
import {
  TEDocument,
  TEEditor,
  TEMutatorLog,
  TENodeID,
  TETextNode,
  TETextPosition,
  TETextSelection
} from "./types";
import { validateNodeMap } from "./validateNodeMap";
import {
  convertRawNodeMapToNodeMap,
  convertNodeMapToRawNodeMap
} from "./Document";

const DEFAULT_EDITOR_STATE = {
  cursorAt: null,
  selection: null,
  isActive: false,
  commandHistory: {
    past: [],
    future: []
  },
  inDebug: false && process.env.NODE_ENV === "development",
  keybindSettings: {
    ArrowLeft: "MoveCursorLeft",
    ArrowRight: "MoveCursorRight",
    "Shift+ArrowLeft": "ModifyNodeSelectionLeft",
    "Shift+ArrowRight": "ModifyNodeSelectionRight",
    Escape: "Escape",
    Backspace: "DeleteBackspace",
    "Ctrl+i": "ToggleTextStyleItalic",
    "Ctrl+b": "ToggleTextStyleBold",
    "Ctrl+u": "ToggleTextStyleUnderline",
    "Ctrl+t": "ToggleTextStyleStrikethrough",
    "Ctrl+a": "MoveCursorToStart",
    "Ctrl+e": "MoveCursorToEnd",
    "Meta+a": "SelectAllNodes",
    "Meta+c": "Copy",
    "Meta+x": "Cut",
    "Ctrl+l": "AddMathNode",
    "Meta+z": "Undo",
    "Meta+/": "MetaSlash",
    "Meta+Shift+z": "Redo",
    F11: "ToggleDebugMode"
  }
};

export default class EditorMutator {
  private source: TEEditor;
  private mutable: TEEditor | undefined;
  private mutatorLogs: TEMutatorLog[];

  constructor(editor: TEEditor) {
    this.source = editor;
    this.mutatorLogs = [];
  }

  static createNewEditorState(
    textAttrs?: Partial<TETextNode>,
    rootId?: TENodeID
  ): TEEditor {
    const nodeMap = new NodeMap({});

    const rootNodeId = nodeMap.createRootNode(rootId);

    nodeMap.appendChild(rootNodeId, {
      ...textAttrs,
      type: "text",
      end: true
    });

    return {
      ...DEFAULT_EDITOR_STATE,
      rootNodeId,
      documentRootNodeId: rootNodeId,
      nodeMap: nodeMap.getCurrentState(),
      mode: "wysiwyg"
    };
  }

  static createExistingEditorState(
    nodeMap: NodeMap,
    rootNodeId: TENodeID
  ): TEEditor;
  static createExistingEditorState(document: TEDocument): TEEditor;
  static createExistingEditorState(
    document: TEDocument | NodeMap,
    rootNodeId?: TENodeID
  ): TEEditor {
    if (document instanceof NodeMap) {
      if (!rootNodeId) {
        throw new Error("rootNodeId must be specified");
      }

      return {
        ...DEFAULT_EDITOR_STATE,
        rootNodeId,
        documentRootNodeId: rootNodeId,
        nodeMap: document.getValidCurrentState(),
        mode: "wysiwyg"
      };
    }

    const nodeMap = convertRawNodeMapToNodeMap(document.nodeMap);

    validateNodeMap(nodeMap);

    return {
      ...DEFAULT_EDITOR_STATE,
      rootNodeId: document.rootNodeId,
      documentRootNodeId: document.rootNodeId,
      nodeMap: nodeMap,
      mode: "wysiwyg"
    };
  }

  static getDocument(editor: TEEditor): TEDocument {
    return {
      nodeMap: convertNodeMapToRawNodeMap(editor.nodeMap),
      rootNodeId: editor.rootNodeId
    };
  }

  getState(): Readonly<TEEditor> {
    return this.mutable || this.source;
  }

  getNodeMap(): NodeMap {
    return new NodeMap((this.mutable || this.source).nodeMap);
  }

  getMutatorLogs(): TEMutatorLog[] {
    return this.mutatorLogs;
  }

  updateAttributes(attrs: Partial<TEEditor>): void {
    Object.assign(this.getMutableEditor(), attrs);
  }

  updateRootNodeId(id: TENodeID): void {
    const editor = this.getMutableEditor();
    const prev = editor.rootNodeId;

    editor.rootNodeId = id;

    this.mutatorLogs.push({
      name: "updateRootNodeId",
      prev,
      next: id
    });
  }

  updateNodeMap(nodeMap: NodeMap): void {
    this.getMutableEditor().nodeMap = nodeMap.getValidCurrentState();

    this.mutatorLogs.push({
      name: "updateNodeMap",
      nodeMapLogs: nodeMap.getNodeMapLogs()
    });
  }

  updateCursorAt(next: TETextPosition | null): void {
    const editor = this.getMutableEditor();

    const prev = editor.cursorAt;
    editor.cursorAt = next;

    this.mutatorLogs.push({
      name: "updateCursorAt",
      prev,
      next
    });
  }

  updateSelection(seletion: TETextSelection | null): void {
    const editor = this.getMutableEditor();
    const prev = editor.selection;

    editor.selection = seletion;

    this.mutatorLogs.push({
      name: "updateSelection",
      prev,
      next: seletion
    });
  }

  private getMutableEditor(): TEEditor {
    if (this.mutable) {
      return this.mutable;
    }

    this.mutable = { ...this.source };

    return this.mutable;
  }
}
