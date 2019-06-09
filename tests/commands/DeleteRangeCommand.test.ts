import { DeleteRangeCommand } from "../../src/core/commands/DeleteRangeCommand";
import { UndoCommand } from "../../src/core/commands/UndoCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import EditorMutator from "../../src/core/EditorMutator";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { U } from "../../src/core/U";
import { getShape } from "./getShape";
import { RedoCommand } from "../../src/core";

test("Delete text within single inline text node", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "t0", ch: 1 },
      end: { id: "t0", ch: 2 }
    }),
    editor,
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "c"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Delete text across multiple text nodes", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

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
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Delete text all", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "t0", ch: 0 },
      end: { id: "te", ch: 0 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Delete media node", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.media("m0", { url: "http://example.com/0" }));
  nodeMap.appendChild("root", U.media("m1", { url: "http://example.com/1" }));
  nodeMap.appendChild("root", U.media("m2", { url: "http://example.com/2" }));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "m0", ch: 0 },
      end: { id: "m2", ch: 0 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      {
        type: "media", url: "http://example.com/2", size: {
          height: 0,
          width: 0,
        }
      },
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Delete text node that behinds link node", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "a"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "b"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

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
        type: "link", url: "", children: [
          { type: "sentinel" },
          { type: "text", text: ["b"], style: {} },
          { type: "sentinel" },
        ]
      },
      { type: "text", text: [], style: {}, end: true }
    ]
  });

  expect(editor.cursorAt).toEqual({
    id: "l0s0",
    ch: 0
  });
});

test("Delete link node and combine between sibling nodes", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "a"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "b"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.text("t1", "b"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

  editor = invokeCommand(
    new DeleteRangeCommand({
      start: { id: "l0s0", ch: 0 },
      end: { id: "t1", ch: 0 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Keep empty link node if delete range does not cover sentinels", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "b"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

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
        type: "link", url: "", children: [
          { type: "sentinel" },
          { type: "text", text: [], style: {} },
          { type: "sentinel" },
        ]
      },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Undo/Redo", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

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
      { type: "text", text: [], style: {}, end: true }
    ]
  });

  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "c"], style: {} },
      { type: "text", text: ["d", "e", "f"], style: {} },
      { type: "text", text: ["g", "h", "i"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });

  editor = invokeCommand(new RedoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "h", "i"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Undo all deletion", () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.text("t2", "ghi"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createExistingEditorState(nodeMap, "root");

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
      { type: "text", text: [], style: {}, end: true }
    ]
  });

  editor = invokeCommand(new RedoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});