import { TEEditor, EditorCommand } from "../../core";
import { TextPositionRegistry } from "../TextPositionRegistry";

export abstract class CommandSelector {
  public abstract select(
    editor: TEEditor,
    TPR: TextPositionRegistry
  ): EditorCommand | undefined;
}
