import { DisableCursorCommand, TEEditor } from "../../core";
import { CommandSelector } from "./CommandSelector";

export class EscapeCommand extends CommandSelector {
  select(editor: TEEditor) {
    return new DisableCursorCommand();
  }
}
