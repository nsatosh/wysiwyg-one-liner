import { EditorMutator } from "../../src/core";
import { MoveCursorToEndCommand, MoveCursorToStartCommand } from "../../src/core/commands/MoveCursorInRowCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { TEEditor, TETextPosition } from "../../src/core/types";
import { U } from "../../src/core/U";

let editor: TEEditor;

beforeEach(() => {
  const nodeMap = new NodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.end("te"));

  editor = EditorMutator.createExistingEditorState(nodeMap, "root");
});

[
  { id: "t1", ch: 0 },
  { id: "t1", ch: 1 },
  { id: "t1", ch: 2 },
  { id: "te", ch: 0 }
].forEach((pos: TETextPosition) => {
  test(`moveCursorToStart ${pos.id}:${pos.ch}`, () => {
    const nextEditor = invokeCommand(new MoveCursorToStartCommand(), {
      ...editor,
      cursorAt: pos
    });

    expect(nextEditor.cursorAt).toEqual({ id: "t1", ch: 0 });
  });
});

[
  { id: "t1", ch: 0 },
  { id: "t1", ch: 1 },
  { id: "t1", ch: 2 },
  { id: "te", ch: 0 }
].forEach((pos: TETextPosition) => {
  test(`moveCursorToEnd ${pos.id}:${pos.ch}`, () => {
    const nextEditor = invokeCommand(new MoveCursorToEndCommand(), {
      ...editor,
      cursorAt: pos
    });

    expect(nextEditor.cursorAt).toEqual({ id: "te", ch: 0 });
  });
});
