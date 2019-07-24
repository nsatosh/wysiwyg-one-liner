import { TECommands, TEDirection } from "../types";
import { CopyCommand } from "./CopyCommand";
import { CutCommand } from "./CutCommand";
import { DeleteBackspaceCommand } from "./DeleteRangeCommand";
import { DisableCursorCommand } from "./DisableCursorCommand";
import { ModifyNodeSelectionCommand } from "./ModifyNodeSelectionCommand";
import { MoveCursorByCharCommand } from "./MoveCursorByCharCommand";
import {
  MoveCursorToEndCommand,
  MoveCursorToStartCommand
} from "./MoveCursorInRowCommand";
import { RedoCommand } from "./RedoCommand";
import { SelectAllNodesCommand } from "./SelectAllNodesCommand";
import { ToggleDebugMode } from "./ToggleDebugMode";
import { UndoCommand } from "./UndoCommand";

export const BUILTIN_COMMANDS: TECommands = {
  MoveCursorLeft: new MoveCursorByCharCommand(-1),
  MoveCursorRight: new MoveCursorByCharCommand(1),
  ModifyNodeSelectionLeft: new ModifyNodeSelectionCommand(TEDirection.left),
  ModifyNodeSelectionRight: new ModifyNodeSelectionCommand(TEDirection.right),
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
};
