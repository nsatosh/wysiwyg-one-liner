import * as ImmutableArray from "@immutable-array/prototype";
import EditorMutator from "./EditorMutator";
import {
  TECommandHistory,
  TECommandHistoryItem,
  TEEditor,
  TEMutatorLog
} from "./types";
import debug = require("debug");
import EditorCommand from "./EditorCommand";

const log = debug("EditorCommand");

const COMMAND_HISTORY_LENGTH = 100;

export function invokeCommand(
  command: EditorCommand,
  editor: TEEditor
): TEEditor {
  log(command.toString(), command);

  const editorMutator = new EditorMutator(editor);
  command.execute(editorMutator);

  {
    const { cursorAt } = editorMutator.getState();
    const nodeMap = editorMutator.getNodeMap();

    if (cursorAt) {
      if (!nodeMap.schema.canHaveCursor(nodeMap.ensureNode(cursorAt.id))) {
        throw new Error("invalid cursor position");
      }
    }
  }

  updateCommandHistory(editorMutator, command);

  return editorMutator.getState();
}

function updateCommandHistory(
  editor: EditorMutator,
  command: EditorCommand
): void {
  const { commandHistory, inComposition } = editor.getState();
  const name = command.toString();

  if (name === "UndoCommand" || name === "RedoCommand") {
    return;
  }

  const logs = editor.getMutatorLogs();

  if (logs.length === 0) {
    return;
  }

  if (name === "ReplaceTextCommand" && inComposition) {
    const { past } = commandHistory;
    const last = past[past.length - 1];

    if (last && last.name === "ReplaceTextCommand" && last.inComposition) {
      editor.updateAttributes({
        commandHistory: mergeLogs(commandHistory, logs)
      });
      return;
    }
  }

  const newHistoryItem: TECommandHistoryItem = {
    name: command.toString(),
    mutatorLogs: logs,
    inComposition: inComposition
  };

  editor.updateAttributes({
    commandHistory: push(commandHistory, newHistoryItem)
  });
}

function push(
  history: TECommandHistory,
  newHistoryItem: TECommandHistoryItem
): TECommandHistory {
  let { past } = history;

  if (past.length >= COMMAND_HISTORY_LENGTH) {
    past = past.slice(1);
  }

  return {
    ...history,
    past: [...past, newHistoryItem],
    future: []
  };
}

function mergeLogs(
  history: TECommandHistory,
  logs: TEMutatorLog[]
): TECommandHistory {
  const { past } = history;
  const last = past[past.length - 1];

  if (!last) {
    return history;
  }

  return {
    ...history,
    past: ImmutableArray.splice(past, past.length - 1, 1, {
      ...last,
      mutatorLogs: [...last.mutatorLogs, ...logs]
    }),
    future: []
  };
}

export function combineCommands(...commands: EditorCommand[]): EditorCommand {
  class Combined extends EditorCommand {
    constructor() {
      super(commands[0].toString());
    }

    public execute(editor: EditorMutator): void {
      commands.forEach(cmd => cmd.execute(editor));
    }
  }

  return new Combined();
}
