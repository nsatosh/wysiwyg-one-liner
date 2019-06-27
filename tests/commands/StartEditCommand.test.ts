import NodeMap from "../../src/core/NodeMap/NodeMap";
import { StartEditCommand } from "../../src/core/commands/StartEditCommand";
import EditorMutator from "../../src/core/EditorMutator";
import { invokeCommand } from "../../src/core/EditorCommand";
import { U } from "../U";

test("Cancel selection", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abcdef"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");
  editor.selection = {
    start: {
      id: "t0",
      ch: 1
    },
    end: {
      id: "t0",
      ch: 4
    },
    focus: "end"
  };

  editor = invokeCommand(new StartEditCommand("te"), editor);

  expect(editor.selection).toBeNull();
});

test("Start edit with node ID", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("te"), editor);

  expect(editor.cursorAt!.id).toBe("te");
});

test("Start edit with node ID and offset", () => {
  const nodeMap = NodeMap.createLegacyNodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abcdef"));
  nodeMap.appendChild("root", U.end("te"));

  let editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor = invokeCommand(new StartEditCommand("t0", 1), editor);

  expect(editor.cursorAt).toEqual({
    id: "t0",
    ch: 1
  });
});
