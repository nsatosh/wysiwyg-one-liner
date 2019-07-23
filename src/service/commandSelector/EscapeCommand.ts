import { DisableCursorCommand } from "../../core/commands/DisableCursorCommand";
import { TEEditor } from "../../core/types";
import { CommandSelector } from "./CommandSelector";

export class EscapeCommand extends CommandSelector {
  select(editor: TEEditor) {
    return new DisableCursorCommand();
  }
}
