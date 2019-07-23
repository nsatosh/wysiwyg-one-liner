import { CopyCommand } from "../core/commands/CopyCommand";
import { CutCommand } from "../core/commands/CutCommand";
import { DeleteBackspaceCommand } from "../core/commands/DeleteRangeCommand";
import { ModifyNodeSelectionCommand } from "../core/commands/ModifyNodeSelectionCommand";
import { MoveCursorByCharCommand } from "../core/commands/MoveCursorByCharCommand";
import {
  MoveCursorToEndCommand,
  MoveCursorToStartCommand
} from "../core/commands/MoveCursorInRowCommand";
import { RedoCommand } from "../core/commands/RedoCommand";
import { SelectAllNodesCommand } from "../core/commands/SelectAllNodesCommand";
import { ToggleDebugMode } from "../core/commands/ToggleDebugMode";
import { UndoCommand } from "../core/commands/UndoCommand";
import EditorCommand from "../core/EditorCommand";
import { TEDirection } from "../core/types";
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
