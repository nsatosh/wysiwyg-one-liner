import {
  AddMathNodeCommand,
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
  ToggleTextStyleCommand,
  UndoCommand
} from "../core";
import { CommandSelector } from "./commandSelector/CommandSelector";
import { EscapeCommand } from "./commandSelector/EscapeCommand";
import { MetaSlashCommand } from "./commandSelector/MetaSlashCommand";

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
  ToggleTextStyleItalic: new ToggleTextStyleCommand("italic"),
  ToggleTextStyleBold: new ToggleTextStyleCommand("bold"),
  ToggleTextStyleUnderline: new ToggleTextStyleCommand("underline"),
  ToggleTextStyleStrikethrough: new ToggleTextStyleCommand("strikethrough"),
  MoveCursorToStart: new MoveCursorToStartCommand(),
  MoveCursorToEnd: new MoveCursorToEndCommand(),
  SelectAllNodes: new SelectAllNodesCommand(),
  Copy: new CopyCommand(),
  Cut: new CutCommand(),
  AddMathNode: new AddMathNodeCommand(),
  Undo: new UndoCommand(),
  MetaSlash: new MetaSlashCommand(),
  Redo: new RedoCommand(),
  ToggleDebugMode: new ToggleDebugMode()
};
