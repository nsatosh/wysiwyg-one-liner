import { BUILTIN_ITEMS } from "./BuiltinNodeSchema";
import { CopyCommand } from "./commands/CopyCommand";
import { CutCommand } from "./commands/CutCommand";
import { DeleteBackspaceCommand } from "./commands/DeleteRangeCommand";
import { DisableCursorCommand } from "./commands/DisableCursorCommand";
import { ModifyNodeSelectionCommand } from "./commands/ModifyNodeSelectionCommand";
import { MoveCursorByCharCommand } from "./commands/MoveCursorByCharCommand";
import {
  MoveCursorToEndCommand,
  MoveCursorToStartCommand
} from "./commands/MoveCursorInRowCommand";
import { RedoCommand } from "./commands/RedoCommand";
import { SelectAllNodesCommand } from "./commands/SelectAllNodesCommand";
import { ToggleDebugMode } from "./commands/ToggleDebugMode";
import { UndoCommand } from "./commands/UndoCommand";
import NodeMap from "./NodeMap/NodeMap";
import { NodeSchema } from "./NodeSchema";
import {
  TEDirection,
  TEEditor,
  TEMutatorLog,
  TENodeID,
  TETextNode,
  TETextPosition,
  TETextSelection
} from "./types";

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
      type: "end"
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
    nodeMap: nodeMap.getValidCurrentState(),
    rootNodeId,
    documentRootNodeId: rootNodeId,
    cursorAt: null,
    selection: null,
    isActive: false,
    commandHistory: {
      past: [],
      future: []
    },
    inDebug: false && process.env.NODE_ENV === "development",
    commands: {
      MoveCursorLeft: new MoveCursorByCharCommand(-1),
      MoveCursorRight: new MoveCursorByCharCommand(1),
      ModifyNodeSelectionLeft: new ModifyNodeSelectionCommand(TEDirection.left),
      ModifyNodeSelectionRight: new ModifyNodeSelectionCommand(
        TEDirection.right
      ),
      Escape: new DisableCursorCommand(),
      DeleteBackspace: new DeleteBackspaceCommand(),
      MoveCursorToStart: new MoveCursorToStartCommand(),
      MoveCursorToEnd: new MoveCursorToEndCommand(),
      SelectAllNodes: new SelectAllNodesCommand(),
      Copy: new CopyCommand(),
      Cut: new CutCommand(),
      Undo: new UndoCommand(),
      Redo: new RedoCommand(),
      ToggleDebugMode: new ToggleDebugMode()
    },
    keybindSettings: {
      ArrowLeft: "MoveCursorLeft",
      ArrowRight: "MoveCursorRight",
      "Shift+ArrowLeft": "ModifyNodeSelectionLeft",
      "Shift+ArrowRight": "ModifyNodeSelectionRight",
      Escape: "Escape",
      Backspace: "DeleteBackspace",
      "Ctrl+a": "MoveCursorToStart",
      "Ctrl+e": "MoveCursorToEnd",
      "Meta+a": "SelectAllNodes",
      "Meta+c": "Copy",
      "Meta+x": "Cut",
      "Meta+z": "Undo",
      "Meta+Shift+z": "Redo",
      F11: "ToggleDebugMode"
    }
  };
}
