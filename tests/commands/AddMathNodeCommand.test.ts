import { AddMathNodeCommand } from "../../src/core/commands/AddMathNodeCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import EditorMutator from "../../src/core/EditorMutator";

test("Do nothing when cursor is not enabled", () => {
  let editor = EditorMutator.createNewEditorState();

  expect(invokeCommand(new AddMathNodeCommand(), editor)).toBe(editor);
});
