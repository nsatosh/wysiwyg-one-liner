import { DeleteRangeCommand } from "../../src/core/commands/DeleteRangeCommand";
import { UndoCommand } from "../../src/core/commands/UndoCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import EditorMutator from "../../src/core/EditorMutator";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { U } from "../U";
import { getShape } from "./getShape";
import { RedoCommand } from "../../src/core";
import { TestingNodeSchema } from "../TestingNodeSchema";

test("Delete text within single inline text node", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "t0", ch: 1 },
      end: { id: "t0", ch: 2 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: ["a", "c"], style: {} }, { type: "end" }]
  });
});

test("Delete text across multiple text nodes", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "t0", ch: 2 },
      end: { id: "t2", ch: 1 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: "abhi".split(""), style: {} },
      { type: "end" }
    ]
  });
});

test("Delete text all", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "t0", ch: 0 },
      end: { id: "te", ch: 0 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "end" }]
  });
});

test("Delete text node that behinds link node", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "a"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "b"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "t0", ch: 0 },
      end: { id: "l0t0", ch: 0 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      {
        type: "link",
        url: "",
        children: [
          { type: "sentinel" },
          { type: "text", text: ["b"], style: {} },
          { type: "sentinel" }
        ]
      },
      { type: "end" }
    ]
  });

  expect(editor.cursorAt).toEqual({
    id: "l0s0",
    ch: 0
  });
});

test("Delete link node and combine between sibling nodes", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "a"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "b"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.text("t1", "b"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "l0s0", ch: 0 },
      end: { id: "t1", ch: 0 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: ["a", "b"], style: {} }, { type: "end" }]
  });
});

test("Keep empty link node if delete range does not cover sentinels", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "b"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "l0t0", ch: 0 },
      end: { id: "te", ch: 0 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      {
        type: "link",
        url: "",
        children: [
          { type: "sentinel" },
          { type: "text", text: [], style: {} },
          { type: "sentinel" }
        ]
      },
      { type: "end" }
    ]
  });
});

test("Undo/Redo", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "t0", ch: 2 },
      end: { id: "t2", ch: 1 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "h", "i"], style: {} },
      { type: "end" }
    ]
  });

  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "c"], style: {} },
      { type: "text", text: ["d", "e", "f"], style: {} },
      { type: "text", text: ["g", "h", "i"], style: {} },
      { type: "end" }
    ]
  });

  editor = invokeCommand(new RedoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "h", "i"], style: {} },
      { type: "end" }
    ]
  });
});

test("Undo all deletion", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "t0", ch: 0 },
      end: { id: "te", ch: 0 }
    }),
    editor
  );

  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "c"], style: {} },
      { type: "text", text: ["d", "e", "f"], style: {} },
      { type: "text", text: ["g", "h", "i"], style: {} },
      { type: "end" }
    ]
  });

  editor = invokeCommand(new RedoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "end" }]
  });
});
