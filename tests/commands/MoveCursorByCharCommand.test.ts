import { invokeCommand } from "../../src/core/EditorCommand";
import { TEEditor } from "../../src/core/types";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { MoveCursorCommand } from "../../src/core/commands/MoveCursorCommand";
import { MoveCursorByCharCommand } from "../../src/core/commands/MoveCursorByCharCommand";
import EditorMutator from "../../src/core/EditorMutator";
import { U } from "../../src/core/U";

let editor: TEEditor;

beforeEach(() => {
  const nodeMap = new NodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));

  editor = EditorMutator.createExistingEditorState(nodeMap, "root");
});

test("Do nothing when cursor is not enabled", () => {
  expect(invokeCommand(new MoveCursorByCharCommand(-1), editor)).toBe(editor);
});

test("Don't move backward when cursor positions at lead of row", () => {
  editor = invokeCommand(new MoveCursorCommand({ id: "t0", ch: 0 }), editor);
  expect(invokeCommand(new MoveCursorByCharCommand(-1), editor)).toBe(editor);
});

test("Don't move forward when cursor positions at end of row", () => {
  editor = invokeCommand(new MoveCursorCommand({ id: "te", ch: 0 }), editor);
  expect(invokeCommand(new MoveCursorByCharCommand(1), editor)).toBe(editor);
});

test("Move within a text node", () => {
  editor = invokeCommand(new MoveCursorCommand({ id: "t1", ch: 2 }), editor);

  editor = invokeCommand(new MoveCursorByCharCommand(-1), editor);
  expect(editor.cursorAt).toEqual({ id: "t1", ch: 1 });

  editor = invokeCommand(new MoveCursorByCharCommand(1), editor);
  expect(editor.cursorAt).toEqual({ id: "t1", ch: 2 });
});

test("Move across text nodes", () => {
  editor = invokeCommand(new MoveCursorCommand({ id: "t1", ch: 2 }), editor);

  editor = invokeCommand(new MoveCursorByCharCommand(1), editor);
  expect(editor.cursorAt).toEqual({ id: "t2", ch: 0 });

  editor = invokeCommand(new MoveCursorByCharCommand(-1), editor);
  expect(editor.cursorAt).toEqual({ id: "t1", ch: 2 });
});
