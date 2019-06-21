import { ModifySelectionCommand } from "../../src/core/commands/ModifySelectionCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import EditorMutator from "../../src/core/EditorMutator";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { U } from "../../src/core/U";

test("Do nothing when cursor is not enabled", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(
    new ModifySelectionCommand({ id: "te", ch: 0 }),
    editor
  );

  expect(editor).toBe(editor);
});

test("Make selection that covers backward character", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "0123"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "t0", ch: 2 };

  editor = invokeCommand(
    new ModifySelectionCommand({ id: "t0", ch: 1 }),
    editor
  );

  expect(editor.selection).toEqual({
    start: { id: "t0", ch: 1 },
    end: { id: "t0", ch: 2 },
    focus: "start"
  });
});

test("Make selection that covers forward character", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "0123"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "t0", ch: 2 };

  editor = invokeCommand(
    new ModifySelectionCommand({ id: "t0", ch: 3 }),
    editor
  );

  expect(editor.selection).toEqual({
    start: { id: "t0", ch: 2 },
    end: { id: "t0", ch: 3 },
    focus: "end"
  });
});

test("Make selection that covers backward node", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "t1", ch: 1 };

  editor = invokeCommand(
    new ModifySelectionCommand({ id: "t0", ch: 2 }),
    editor
  );

  expect(editor.selection).toEqual({
    start: { id: "t0", ch: 2 },
    end: { id: "t1", ch: 1 },
    focus: "start"
  });
});

test("Make selection that covers forward node", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));
  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "t0", ch: 2 };

  editor = invokeCommand(
    new ModifySelectionCommand({ id: "t1", ch: 1 }),
    editor
  );

  expect(editor.selection).toEqual({
    start: { id: "t0", ch: 2 },
    end: { id: "t1", ch: 1 },
    focus: "end"
  });
});