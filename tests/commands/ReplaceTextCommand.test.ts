import { EndCompositionCommand, RedoCommand, StartCompositionCommand, UpdateCursorInComposition } from "../../src/core";
import { MoveCursorByCharCommand } from "../../src/core/commands/MoveCursorByCharCommand";
import { ReplaceTextCommand } from "../../src/core/commands/ReplaceTextCommand";
import { StartEditCommand } from "../../src/core/commands/StartEditCommand";
import { UndoCommand } from "../../src/core/commands/UndoCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import EditorMutator from "../../src/core/EditorMutator";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { getRangeCoversAll } from "../../src/core/range";
import { TEEditor } from "../../src/core/types";
import { U } from "../U";
import { getShape } from "./getShape";

let editor: TEEditor;

test("Insert text at cursor position", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new ReplaceTextCommand("abc"), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "c"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Replace text within single inline text node", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new ReplaceTextCommand("d", {
      start: { id: "t0", ch: 1 },
      end: { id: "t0", ch: 2 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "d", "c"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Replace text across multiple text nodes", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  // |abc|def| -> |abgef|
  editor = invokeCommand(
    new ReplaceTextCommand("g", {
      start: { id: "t0", ch: 2 },
      end: { id: "t1", ch: 1 }
    }),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: "abgef".split(""), style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Replace text all", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new ReplaceTextCommand(
      "replaced",
      getRangeCoversAll(NodeMap.createLegacyNodeMap(editor.nodeMap), editor.rootNodeId)
    ),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: "replaced".split(""), style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Input IME text in empty row", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "k"));
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new StartCompositionCommand(), editor);
  expect(editor.inComposition).toBe(true);
  expect(editor.compositionRange).toBeUndefined();

  editor = invokeCommand(
    new ReplaceTextCommand("k"),
    editor
  );
  expect(editor.inComposition).toBe(true);
  expect(editor.compositionRange).not.toBeUndefined();

  editor = invokeCommand(
    new ReplaceTextCommand("っk"),
    editor
  );

  editor = invokeCommand(
    new ReplaceTextCommand("っっk"),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: "kっっk".split(""), style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  })
});

test("Modify backward node if input has occurred at sentinel", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "def"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "l0s0", ch: 0 };
  editor = invokeCommand(new ReplaceTextCommand("あ"), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "c", "あ"], style: {} },
      {
        type: "link",
        children: [
          { type: "sentinel" },
          { type: "text", text: ["d", "e", "f"], style: {} },
          { type: "sentinel" }
        ],
        url: ""
      },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Undo", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new ReplaceTextCommand("a"), editor);
  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Undo command restores cursor position", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  // Input 'a', 'b', and 'c', then move cursor 2 characters left.
  // At this point, the cursor is located between 'a' and 'b'.
  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new ReplaceTextCommand("a"), editor);
  editor = invokeCommand(new ReplaceTextCommand("b"), editor);
  editor = invokeCommand(new ReplaceTextCommand("c"), editor);
  editor = invokeCommand(new MoveCursorByCharCommand(-1), editor);
  editor = invokeCommand(new MoveCursorByCharCommand(-1), editor);

  // Undo command moves cursor after 'b'.
  editor = invokeCommand(new UndoCommand(), editor);

  expect(editor.cursorAt).toEqual({ id: "te", ch: 0 });
});

test("Undo/Redo IME input", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new ReplaceTextCommand("a"), editor);
  editor = invokeCommand(new StartCompositionCommand(), editor);
  editor = invokeCommand(new ReplaceTextCommand("あ"), editor);
  editor = invokeCommand(new UpdateCursorInComposition("あ", 0, 1), editor);
  editor = invokeCommand(new ReplaceTextCommand("あい"), editor);
  editor = invokeCommand(new UpdateCursorInComposition("あい", 0, 2), editor);
  editor = invokeCommand(new EndCompositionCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: "aあい".split(""), style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });

  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: "a".split(""), style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });

  editor = invokeCommand(new RedoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: "aあい".split(""), style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Undo/Redo first IME input", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new StartCompositionCommand(), editor);
  editor = invokeCommand(new ReplaceTextCommand("a"), editor);
  editor = invokeCommand(new EndCompositionCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });

  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: [], style: {}, end: true }
    ]
  });

  editor = invokeCommand(new RedoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});
