import * as ImmutableArray from "@immutable-array/prototype";
import EditorCommand from "../EditorCommand";
import {
  TEMutatorLogUpdateNodeMap,
  TEMutatorLogUpdateCursorAt,
  TEMutatorLogUpdateSelection,
  TEMutatorLogUpdateRootNodeId
} from "../types";
import EditorMutator from "../EditorMutator";
import NodeMap from "../NodeMap/NodeMap";

export class RedoCommand extends EditorCommand {
  constructor() {
    super("RedoCommand");
  }

  execute(editor: EditorMutator): void {
    const { commandHistory } = editor.getState();
    const { future } = commandHistory;
    const redoingCommandObject = future[future.length - 1];

    if (!redoingCommandObject) {
      return;
    }

    redoingCommandObject.mutatorLogs.forEach(mutatorLog => {
      switch (mutatorLog.name) {
        case "updateRootNodeId":
          redoUpdateRootNodeId(editor, mutatorLog);
          break;
        case "updateNodeMap":
          return redoNodeMap(editor, mutatorLog);
        case "updateCursorAt":
          return redoUpdateCursorAt(editor, mutatorLog);
        case "updateSelection":
          return redoUpdateSelection(editor, mutatorLog);
        default:
          console.warn(`Unsupported log type ${(mutatorLog as any).name}`);
          return;
      }
    });

    if (future.length === 0) {
      return;
    }

    editor.updateAttributes({
      commandHistory: {
        ...commandHistory,
        past: [...commandHistory.past, future[future.length - 1]],
        future: ImmutableArray.pop(future)
      }
    });
  }
}

function redoNodeMap(
  editorMutator: EditorMutator,
  mutatorLog: TEMutatorLogUpdateNodeMap
): void {
  const nodeMap = NodeMap.createLegacyNodeMap(editorMutator.getState().nodeMap);

  mutatorLog.nodeMapLogs.forEach(nodeMapLog => {
    const { prev, next } = nodeMapLog;

    if (next) {
      nodeMap.setNode(next.id, next);
    } else if (prev) {
      nodeMap.unsetNode(prev.id);
    }
  });

  editorMutator.updateNodeMap(nodeMap);
}

function redoUpdateCursorAt(
  editorMutator: EditorMutator,
  mutatorLog: TEMutatorLogUpdateCursorAt
): void {
  editorMutator.updateCursorAt(mutatorLog.next);
}

function redoUpdateSelection(
  editorMutator: EditorMutator,
  mutatorLog: TEMutatorLogUpdateSelection
): void {
  editorMutator.updateSelection(mutatorLog.next);
}

function redoUpdateRootNodeId(
  editorMutator: EditorMutator,
  mutatorLog: TEMutatorLogUpdateRootNodeId
): void {
  editorMutator.updateRootNodeId(mutatorLog.prev);
}
