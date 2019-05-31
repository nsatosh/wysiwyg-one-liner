import {
  CancelLinkFormCommand,
  CancelMediaFormCommand,
  DisableCursorCommand,
  TEEditor
} from "../../core";
import { CommandSelector } from "./CommandSelector";

export class EscapeCommand extends CommandSelector {
  select(editor: TEEditor) {
    const { linkForm, mediaForm } = editor;

    if (linkForm) {
      return new CancelLinkFormCommand();
    }

    if (mediaForm) {
      return new CancelMediaFormCommand();
    }

    return new DisableCursorCommand();
  }
}
