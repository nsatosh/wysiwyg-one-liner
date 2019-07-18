import {
  CopyCommand,
  CutCommand,
  DeleteBackspaceCommand,
  EditorCommand,
  ModifyNodeSelectionCommand,
  MoveCursorByCharCommand,
  MoveCursorToEndCommand,
  MoveCursorToStartCommand,
  RedoCommand,
  SelectAllNodesCommand,
  TEDirection,
  ToggleDebugMode,
  UndoCommand
} from "../core";
import { CommandSelector } from "./commandSelector/CommandSelector";
import { EscapeCommand } from "./commandSelector/EscapeCommand";

export interface KeybindableCommands {
  [name: string]: CommandSelector | EditorCommand;
}

export const keybindableCommands: KeybindableCommands = {
  MoveCursorLeft: new MoveCursorByCharCommand(-1),
  MoveCursorRight: new MoveCursorByCharCommand(1),
  ModifyNodeSelectionLeft: new ModifyNodeSelectionCommand(TEDirection.left),
  ModifyNodeSelectionRight: new ModifyNodeSelectionCommand(TEDirection.right),
  Escape: new EscapeCommand(),
  DeleteBackspace: new DeleteBackspaceCommand(),
  MoveCursorToStart: new MoveCursorToStartCommand(),
  MoveCursorToEnd: new MoveCursorToEndCommand(),
  SelectAllNodes: new SelectAllNodesCommand(),
  Copy: new CopyCommand(),
  Cut: new CutCommand(),
  Undo: new UndoCommand(),
  Redo: new RedoCommand(),
  ToggleDebugMode: new ToggleDebugMode()
};
