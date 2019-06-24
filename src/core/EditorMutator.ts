import NodeMap from "./NodeMap/NodeMap";
import {
  TEEditor,
  TEMutatorLog,
  TENodeID,
  TETextPosition,
  TETextSelection,
  TETextNode
} from "./types";
import { NodeSchema } from "./NodeSchema";
import { BUILTIN_ITEMS } from "./BuiltinNodeSchema";

export default class EditorMutator {
  private source: TEEditor;
  private mutable: TEEditor | undefined;
  private mutatorLogs: TEMutatorLog[];

  constructor(editor: TEEditor) {
    this.source = editor;
    this.mutatorLogs = [];
  }

  static createNewEditorState(nodeSchema?: NodeSchema): TEEditor {
    const schema = nodeSchema || new NodeSchema(BUILTIN_ITEMS);

    const nodeMap = new NodeMap(schema, {});
    const rootNodeId = nodeMap.createRootNode();

    nodeMap.appendChild<TETextNode>(rootNodeId, {
      type: "text",
      end: true
    });

    return generateInitialEditorState(schema, nodeMap, rootNodeId);
  }

  static createFromNodeMap(src: NodeMap, rootNodeId: TENodeID): TEEditor {
    return generateInitialEditorState(src.schema, src, rootNodeId);
  }

  getState(): Readonly<TEEditor> {
    return this.mutable || this.source;
  }

  getNodeMap(): NodeMap {
    const { nodeMap, nodeSchema } = this.getState();

    return new NodeMap(nodeSchema, nodeMap);
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

function generateInitialEditorState(
  nodeSchema: NodeSchema,
  nodeMap: NodeMap,
  rootNodeId: TENodeID
): TEEditor {
  return {
    nodeSchema: nodeSchema || new NodeSchema(BUILTIN_ITEMS),
    nodeMap: nodeMap.getCurrentState(),
    rootNodeId,
    documentRootNodeId: rootNodeId,
    cursorAt: null,
    selection: null,
    isActive: false,
    commandHistory: {
      past: [],
      future: []
    },
    mode: "wysiwyg",
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
}
