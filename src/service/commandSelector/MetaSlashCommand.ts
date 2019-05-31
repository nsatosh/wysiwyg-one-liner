import { ModifyModeCommand, TEEditor } from "../../core";
import { CommandSelector } from "./CommandSelector";

export class MetaSlashCommand extends CommandSelector {
  select(editor: TEEditor) {
    if (editor.mode === "wysiwyg") {
      return new ModifyModeCommand("plain");
    } else {
      return new ModifyModeCommand("wysiwyg");
    }
  }
}
