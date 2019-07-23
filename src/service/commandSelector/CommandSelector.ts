import EditorCommand from "../../core/EditorCommand";
import { TEEditor } from "../../core/types";
import { TextPositionRegistry } from "../TextPositionRegistry";

export abstract class CommandSelector {
  public abstract select(
    editor: TEEditor,
    TPR: TextPositionRegistry
  ): EditorCommand | undefined;
}
