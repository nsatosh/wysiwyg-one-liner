import {
  DeleteBackspaceCommand,
  EditorMutator,
  invokeCommand,
  NodeMap
} from "../../src/core";
import { U } from "../../src/core/U";
import { getShape } from "./getShape";

test("Backspace from lead of link node", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

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
      { type: "text", text: ["a", "b"], style: {} },
      {
        type: "link",
        children: [
          { type: "sentinel" },
          { type: "text", text: ["d", "e", "f"], style: {} },
          { type: "sentinel" }
        ],
        url: ""
      },
      { type: "text", text: ["g", "h", "i"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Delete last of link node", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

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
      { type: "text", text: ["a", "b", "c"], style: {} },
      {
        type: "link",
        children: [
          { type: "sentinel" },
          { type: "text", text: ["d", "e"], style: {} },
          { type: "sentinel" }
        ],
        url: ""
      },
      { type: "text", text: ["g", "h", "i"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Backspace more than two or more sentinels", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

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
      { type: "text", text: ["a", "b"], style: {} },
      { type: "sentinel" },
      { type: "sentinel" },
      { type: "text", text: ["d", "e", "f"], style: {} },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Backspace from lead of empty link node", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

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
      { type: "text", text: ["a", "b"], style: {} },
      {
        type: "link", children: [
          { type: "sentinel" },
          { type: "text", text: [], style: {} },
          { type: "sentinel" }
        ], url: ""
      },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});

test("Backspace a empty link node that positions at lead of row", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

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
    children: [{ type: "text", text: [], style: {}, end: true }]
  });
});

test("Backspace in link node that positions at lead of row", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

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
          { type: "sentinel" },
          { type: "text", text: [], style: {} },
          { type: "sentinel" }
        ],
        url: ""
      },
      { type: "text", text: [], style: {}, end: true }
    ]
  });
});
