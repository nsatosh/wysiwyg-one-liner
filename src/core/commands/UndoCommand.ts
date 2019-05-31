import * as ImmutableArray from "@immutable-array/prototype";
import EditorCommand from "../EditorCommand";
import {
  TEMutatorLogUpdateCursorAt,
  TEMutatorLogUpdateNodeMap,
  TEMutatorLogUpdateSelection,
  TEMutatorLogUpdateRootNodeId
} from "../types";
import EditorMutator from "../EditorMutator";

export class UndoCommand extends EditorCommand {
  constructor() {
    super("UndoCommand");
  }

  execute(editor: EditorMutator): void {
    const { commandHistory } = editor.getState();
    const { past } = commandHistory;
    const undoingCommandObject = past[past.length - 1];

    if (!undoingCommandObject) {
      return;
    }

    editor.updateAttributes({
      selection: null
    });

    const { mutatorLogs } = undoingCommandObject;

    for (let i = mutatorLogs.length - 1; i >= 0; i--) {
      const mutatorLog = mutatorLogs[i];

      switch (mutatorLog.name) {
        case "updateRootNodeId":
          undoUpdateRootNodeId(editor, mutatorLog);
          break;
        case "updateNodeMap":
          undoNodeMap(editor, mutatorLog);
          break;
        case "updateCursorAt":
          undoUpdateCursorAt(editor, mutatorLog);
          break;
        case "updateSelection":
          undoUpdateSelection(editor, mutatorLog);
          break;
        default:
          console.warn(`Unsupported log type ${(mutatorLog as any).name}`);
      }
    }

    if (past.length === 0) {
      return;
    }

    editor.updateAttributes({
      commandHistory: {
        ...commandHistory,
        past: ImmutableArray.pop(past),
        future: [...commandHistory.future, past[past.length - 1]]
      }
    });
  }
}

function undoNodeMap(
  editorMutator: EditorMutator,
  mutatorLog: TEMutatorLogUpdateNodeMap
): void {
  const nodeMap = editorMutator.getNodeMap();
  const { nodeMapLogs } = mutatorLog;

  for (let i = nodeMapLogs.length - 1; i >= 0; i--) {
    const { prev, next } = nodeMapLogs[i];

    if (prev) {
      nodeMap.setNode(prev.id, prev);
    } else if (next) {
      nodeMap.unsetNode(next.id);
    }
  }

  editorMutator.updateNodeMap(nodeMap);
}

function undoUpdateCursorAt(
  editorMutator: EditorMutator,
  mutatorLog: TEMutatorLogUpdateCursorAt
): void {
  editorMutator.updateCursorAt(mutatorLog.prev);
}

function undoUpdateSelection(
  editorMutator: EditorMutator,
  mutatorLog: TEMutatorLogUpdateSelection
): void {
  editorMutator.updateSelection(mutatorLog.prev);
}

function undoUpdateRootNodeId(
  editorMutator: EditorMutator,
  mutatorLog: TEMutatorLogUpdateRootNodeId
): void {
  editorMutator.updateRootNodeId(mutatorLog.prev);
}
