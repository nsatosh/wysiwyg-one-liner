import { EditorMutator } from "../../src/core";
import {
  MoveCursorToEndCommand,
  MoveCursorToStartCommand
} from "../../src/core/commands/MoveCursorInRowCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { TEEditor, TETextPosition } from "../../src/core/types";
import { U } from "../U";
import { TestingNodeSchema } from "../TestingNodeSchema";

let editor: TEEditor;

beforeEach(() => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.end("te"));

  editor = EditorMutator.createFromNodeMap(nodeMap, "root");
});
[
  { id: "t0", ch: 0 },
  { id: "t0", ch: 1 },
  { id: "t0", ch: 2 },
  { id: "te", ch: 0 }
].forEach((pos: TETextPosition) => {
  test(`moveCursorToStart ${pos.id}:${pos.ch}`, () => {
    const nextEditor = invokeCommand(new MoveCursorToStartCommand(), {
      ...editor,
      cursorAt: pos
    });

    expect(nextEditor.cursorAt).toEqual({ id: "t0", ch: 0 });
  });
});
[
  { id: "t0", ch: 0 },
  { id: "t0", ch: 1 },
  { id: "t0", ch: 2 },
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
