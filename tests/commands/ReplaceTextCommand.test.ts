import { SentinelNodeType } from "../../src/core/BuiltinNodeSchema";
import { EndCompositionCommand } from "../../src/core/commands/EndCompositionCommand";
import { MoveCursorByCharCommand } from "../../src/core/commands/MoveCursorByCharCommand";
import { RedoCommand } from "../../src/core/commands/RedoCommand";
import { ReplaceTextCommand } from "../../src/core/commands/ReplaceTextCommand";
import { StartCompositionCommand } from "../../src/core/commands/StartCompositionCommand";
import { StartEditCommand } from "../../src/core/commands/StartEditCommand";
import { UndoCommand } from "../../src/core/commands/UndoCommand";
import { UpdateCursorInComposition } from "../../src/core/commands/UpdateCursorInComposition";
import { invokeCommand } from "../../src/core/invokeCommand";
import EditorMutator from "../../src/core/EditorMutator";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { getRangeCoversAll } from "../../src/core/range";
import { TEEditor } from "../../src/core/types";
import { TestingNodeSchema } from "../TestingNodeSchema";
import { U } from "../U";
import { getShape } from "./getShape";

let editor: TEEditor;

test("Insert text at cursor position", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new ReplaceTextCommand("abc"), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: ["a", "b", "c"] }, { type: "end" }]
  });
});

test("Replace text within single inline text node", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
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
    children: [{ type: "text", text: ["a", "d", "c"] }, { type: "end" }]
  });
});

test("Replace text across multiple text nodes", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
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
    children: [{ type: "text", text: "abgef".split("") }, { type: "end" }]
  });
});

test("Replace text all", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new ReplaceTextCommand(
      "replaced",
      getRangeCoversAll(nodeMap, editor.rootNodeId)
    ),
    editor
  );

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: "replaced".split("") }, { type: "end" }]
  });
});

test("Input IME text in empty row", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "k"));
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new StartCompositionCommand(), editor);
  expect(editor.inComposition).toBe(true);
  expect(editor.compositionRange).toBeUndefined();

  editor = invokeCommand(new ReplaceTextCommand("k"), editor);
  expect(editor.inComposition).toBe(true);
  expect(editor.compositionRange).not.toBeUndefined();

  editor = invokeCommand(new ReplaceTextCommand("っk"), editor);

  editor = invokeCommand(new ReplaceTextCommand("っっk"), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: "kっっk".split("") }, { type: "end" }]
  });
});

test("Modify backward node if input has occurred at sentinel", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
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
      { type: "text", text: ["a", "b", "c", "あ"] },
      {
        type: "link",
        children: [
          { type: SentinelNodeType },
          { type: "text", text: ["d", "e", "f"] },
          { type: SentinelNodeType }
        ],
        url: ""
      },
      { type: "end" }
    ]
  });
});

test("Undo", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new ReplaceTextCommand("a"), editor);
  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "end" }]
  });
});

test("Undo command restores cursor position", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
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
  const nodeMap = new NodeMap(TestingNodeSchema, {});
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
    children: [{ type: "text", text: "aあい".split("") }, { type: "end" }]
  });

  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: "a".split("") }, { type: "end" }]
  });

  editor = invokeCommand(new RedoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: "aあい".split("") }, { type: "end" }]
  });
});

test("Undo/Redo first IME input", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);
  editor = invokeCommand(new StartCompositionCommand(), editor);
  editor = invokeCommand(new ReplaceTextCommand("a"), editor);
  editor = invokeCommand(new EndCompositionCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: ["a"] }, { type: "end" }]
  });

  editor = invokeCommand(new UndoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "end" }]
  });

  editor = invokeCommand(new RedoCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "text", text: ["a"] }, { type: "end" }]
  });
});
