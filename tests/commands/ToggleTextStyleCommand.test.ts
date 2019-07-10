import { ToggleTextStyleCommand } from "../../src/core/commands/ToggleTextStyleCommand";
import { invokeCommand } from "../../src/core/EditorCommand";
import EditorMutator from "../../src/core/EditorMutator";
import NodeMap from "../../src/core/NodeMap/NodeMap";
import { TEEditor } from "../../src/core/types";
import { U } from "../U";
import { getShape } from "./getShape";
import { TestingNodeSchema } from "../TestingNodeSchema";
import { SentinelNodeType } from "../../src/core/BuiltinNodeSchema";

describe("Change style on single text node", () => {
  let editor: TEEditor;

  beforeEach(() => {
    const nodeMap = new NodeMap(TestingNodeSchema, {});

    nodeMap.createRootNode("root");
    nodeMap.appendChild("root", U.text("t0", "abcdef"));
    nodeMap.appendChild("root", U.end("te"));

    editor = EditorMutator.createFromNodeMap(nodeMap, "root");
  });

  test("starting", () => {
    editor.selection = {
      start: { id: "t0", ch: 0 },
      end: { id: "t0", ch: 1 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        { type: "text", text: ["a"], style: { bold: true } },
        { type: "text", text: ["b", "c", "d", "e", "f"], style: {} },
        { type: "end" }
      ]
    });
  });

  test("intermediate", () => {
    editor.selection = {
      start: { id: "t0", ch: 1 },
      end: { id: "t0", ch: 3 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        { type: "text", text: ["a"], style: {} },
        { type: "text", text: ["b", "c"], style: { bold: true } },
        { type: "text", text: ["d", "e", "f"], style: {} },
        { type: "end" }
      ]
    });
  });

  test("end", () => {
    editor.selection = {
      start: { id: "t0", ch: 1 },
      end: { id: "te", ch: 0 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        { type: "text", text: ["a"], style: {} },
        {
          type: "text",
          text: ["b", "c", "d", "e", "f"],
          style: { bold: true }
        },
        { type: "end" }
      ]
    });
  });

  test("all", () => {
    editor.selection = {
      start: { id: "t0", ch: 0 },
      end: { id: "te", ch: 0 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        {
          type: "text",
          text: ["a", "b", "c", "d", "e", "f"],
          style: { bold: true }
        },
        { type: "end" }
      ]
    });
  });
});

describe("Change text style across text nodes", () => {
  test("intermediate", () => {
    const nodeMap = new NodeMap(TestingNodeSchema, {});

    nodeMap.createRootNode("root");
    nodeMap.appendChild("root", U.text("t0", "abc"));
    nodeMap.appendChild("root", U.text("t1", "def"));
    nodeMap.appendChild("root", U.end("te"));

    let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

    editor.selection = {
      start: { id: "t0", ch: 2 },
      end: { id: "t1", ch: 1 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        { type: "text", text: ["a", "b"], style: {} },
        { type: "text", text: ["c", "d"], style: { bold: true } },
        { type: "text", text: ["e", "f"], style: {} },
        { type: "end" }
      ]
    });
  });

  test("all", () => {
    const nodeMap = new NodeMap(TestingNodeSchema, {});

    nodeMap.createRootNode("root");
    nodeMap.appendChild("root", U.text("t0", "abc"));
    nodeMap.appendChild("root", U.text("t1", "def"));
    nodeMap.appendChild("root", U.end("te"));

    let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

    editor.selection = {
      start: { id: "t0", ch: 0 },
      end: { id: "te", ch: 0 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        {
          type: "text",
          text: ["a", "b", "c", "d", "e", "f"],
          style: { bold: true }
        },
        { type: "end" }
      ]
    });
  });
});

describe("Change text style across link node", () => {
  let editor: TEEditor;

  beforeEach(() => {
    const nodeMap = new NodeMap(TestingNodeSchema, {});

    nodeMap.createRootNode("root");
    nodeMap.appendChild("root", U.text("t0", "abc"));
    nodeMap.appendChild("root", U.link("l0"));
    nodeMap.appendChild("l0", U.sentinel("l0s0"));
    nodeMap.appendChild("l0", U.text("l0t0", "def"));
    nodeMap.appendChild("l0", U.sentinel("l0s1"));
    nodeMap.appendChild("root", U.text("t1", "ghi"));
    nodeMap.appendChild("root", U.end("te"));

    editor = EditorMutator.createFromNodeMap(nodeMap, "root");
  });

  test("starting", () => {
    editor.selection = {
      start: { id: "t0", ch: 2 },
      end: { id: "l0t0", ch: 1 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        { type: "text", text: ["a", "b"], style: {} },
        { type: "text", text: ["c"], style: { bold: true } },
        {
          type: "link",
          children: [
            { type: SentinelNodeType },
            { type: "text", text: ["d"], style: { bold: true } },
            { type: "text", text: ["e", "f"], style: {} },
            { type: SentinelNodeType }
          ],
          url: ""
        },
        { type: "text", text: ["g", "h", "i"], style: {} },
        { type: "end" }
      ]
    });
  });

  test("end", () => {
    editor.selection = {
      start: { id: "l0t0", ch: 2 },
      end: { id: "t1", ch: 1 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        { type: "text", text: ["a", "b", "c"], style: {} },
        {
          type: "link",
          children: [
            { type: SentinelNodeType },
            { type: "text", text: ["d", "e"], style: {} },
            { type: "text", text: ["f"], style: { bold: true } },
            { type: SentinelNodeType }
          ],
          url: ""
        },
        { type: "text", text: ["g"], style: { bold: true } },
        { type: "text", text: ["h", "i"], style: {} },
        { type: "end" }
      ]
    });
  });

  test("all", () => {
    editor.selection = {
      start: { id: "l0s0", ch: 0 },
      end: { id: "l0s1", ch: 0 },
      focus: "end"
    };

    editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

    expect(getShape(editor.nodeMap, "root")).toEqual({
      type: "row",
      children: [
        { type: "text", text: ["a", "b", "c"], style: {} },
        {
          type: "link",
          children: [
            { type: SentinelNodeType },
            {
              type: "text",
              text: ["d", "e", "f"],
              style: { bold: true }
            },
            { type: SentinelNodeType }
          ],
          url: ""
        },
        { type: "text", text: ["g", "h", "i"], style: {} },
        { type: "end" }
      ]
    });
  });
});

test("Combine nodes after changing text style", () => {
  const nodeMap = new NodeMap(TestingNodeSchema, {});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "a"));
  nodeMap.appendChild("root", U.text("t1", "b", { style: { bold: true } }));
  nodeMap.appendChild("root", U.text("t2", "c"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.selection = {
    start: { id: "t1", ch: 0 },
    end: { id: "t2", ch: 0 },
    focus: "end"
  };

  editor = invokeCommand(new ToggleTextStyleCommand("bold"), editor);

  expect(getShape(editor.nodeMap, "root")).toEqual({
    type: "row",
    children: [
      { type: "text", text: ["a", "b", "c"], style: {} },
      { type: "end" }
    ]
  });
});
