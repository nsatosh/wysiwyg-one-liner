import { SentinelNodeType } from "../../src/core/BuiltinNodeSchema";
import { DeleteBackspaceCommand } from "../../src/core/commands/DeleteRangeCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import EditorMutator from "../../src/core/EditorMutator";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { TestingNodeSchema } from "../TestingNodeSchema";
import { U } from "../U";
import { getShape } from "./getShape";

test("Backspace from lead of link node", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");

  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "def"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.text("t1", "ghi"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "l0t0", ch: 0 };
  editor = invokeCommand(new DeleteBackspaceCommand(), editor);
  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b"] },
      {
        type: "link",
        children: [
          { type: SentinelNodeType },
          { type: "text", text: ["d", "e", "f"] },
          { type: SentinelNodeType }
        ],
        url: ""
      },
      { type: "text", text: ["g", "h", "i"] },
      { type: "end" }
    ]
  });
});

test("Delete last of link node", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "def"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.text("t1", "ghi"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "l0s1", ch: 0 };
  editor = invokeCommand(new DeleteBackspaceCommand(), editor);
  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "c"] },
      {
        type: "link",
        children: [
          { type: SentinelNodeType },
          { type: "text", text: ["d", "e"] },
          { type: SentinelNodeType }
        ],
        url: ""
      },
      { type: "text", text: ["g", "h", "i"] },
      { type: "end" }
    ]
  });
});

test("Backspace more than two or more sentinels", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.sentinel("s0"));
  nodeMap.appendChild("root", U.sentinel("s1"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "t1", ch: 0 };

  editor = invokeCommand(new DeleteBackspaceCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b"] },
      { type: SentinelNodeType },
      { type: SentinelNodeType },
      { type: "text", text: ["d", "e", "f"] },
      { type: "end" }
    ]
  });
});

test("Backspace from lead of empty link node", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", ""));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "l0t0", ch: 0 };
  editor = invokeCommand(new DeleteBackspaceCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b"] },
      {
        type: "link",
        children: [
          { type: SentinelNodeType },
          { type: "text", text: [] },
          { type: SentinelNodeType }
        ],
        url: ""
      },
      { type: "end" }
    ]
  });
});

test("Backspace a empty link node that positions at lead of row", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", ""));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "te", ch: 0 };
  editor = invokeCommand(new DeleteBackspaceCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [{ type: "end" }]
  });
});

test("Backspace in link node that positions at lead of row", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", ""));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.cursorAt = { id: "l0t0", ch: 0 };
  editor = invokeCommand(new DeleteBackspaceCommand(), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      {
        type: "link",
        children: [
          { type: SentinelNodeType },
          { type: "text", text: [] },
          { type: SentinelNodeType }
        ],
        url: ""
      },
      { type: "end" }
    ]
  });
});
