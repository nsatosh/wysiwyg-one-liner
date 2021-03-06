import { SelectAllNodesCommand } from "../../src/core/commands/SelectAllNodesCommand";
import { invokeCommand } from "../../src/core/invokeCommand";
import EditorMutator from "../../src/core/EditorMutator";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { TETextPosition, TETextSelection } from "../../src/core/types";
import { U } from "../U";
import { TestingNodeSchema } from "../TestingNodeSchema";

test("Do nothing when document is empty", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");
  editor.cursorAt = { id: "te", ch: 0 };

  expect(invokeCommand(new SelectAllNodesCommand(), editor)).toBe(editor);
});

test("Selection covers all node in document", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");
  editor.cursorAt = { id: "t1", ch: 2 };

  editor = invokeCommand(new SelectAllNodesCommand(), editor);

  expect(editor.selection).toEqual({
    start: {
      id: "t0",
      ch: 0
    },
    end: {
      id: "te",
      ch: 0
    },
    focus: "end"
  } as TETextSelection);
});

test("Cursor positions at end of document", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");
  editor.cursorAt = { id: "t1", ch: 2 };

  editor = invokeCommand(new SelectAllNodesCommand(), editor);

  expect(editor.cursorAt).toEqual({
    id: "te",
    ch: 0
  } as TETextPosition);
});
