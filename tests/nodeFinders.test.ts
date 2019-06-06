import { getSiblingLeafInSameBlock, walkBackwardNodes, walkForwardNodes } from "../src/core/nodeFinders";
import NodeMap from "../src/core/NodeMap/NodeMap";
import { TENodeID } from "../src/core/types";
import { U } from "../src/core/U";

test("getSiblingLeafInSameBlock", () => {
  const nodeMap = new NodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.link("l0"));
  nodeMap.appendChild("l0", U.sentinel("l0s0"));
  nodeMap.appendChild("l0", U.text("l0t0", "def"));
  nodeMap.appendChild("l0", U.sentinel("l0s1"));
  nodeMap.appendChild("root", U.end("te"));

  function f(nodeMap: NodeMap, id: TENodeID, dir: 1 | -1) {
    const node = getSiblingLeafInSameBlock(nodeMap, id, dir);

    if (node) {
      return node.id;
    }
  }

  expect(f(nodeMap, "t0", 1)).toBe("l0s0");
  expect(f(nodeMap, "l0s0", 1)).toBe("l0t0");
  expect(f(nodeMap, "l0t0", 1)).toBe("l0s1")
  expect(f(nodeMap, "l0s1", 1)).toBe("te")
  expect(f(nodeMap, "te", 1)).toBeUndefined();

  expect(f(nodeMap, "t0", -1)).toBeUndefined();
  expect(f(nodeMap, "l0s0", -1)).toBe("t0");
  expect(f(nodeMap, "l0t0", -1)).toBe("l0s0")
  expect(f(nodeMap, "l0s1", -1)).toBe("l0t0")
  expect(f(nodeMap, "te", -1)).toBe("l0s1")
});

describe("walkForwardNodes", () => {
  test("Start traverse from specified node ID", () => {
    const nodeMap = new NodeMap({});

    nodeMap.createRootNode("root");
    nodeMap.appendChild("root", U.text("t0", "abc"));
    nodeMap.appendChild("root", U.link("l0"));
    nodeMap.appendChild("l0", U.sentinel("l0s0"));
    nodeMap.appendChild("l0", U.text("l0t0", "def"));
    nodeMap.appendChild("l0", U.sentinel("l0s1"));
    nodeMap.appendChild("root", U.end("te"));

    const patterns = [
      ["root", ["root", "t0", "l0", "l0s0", "l0t0", "l0s1", "te"]],
      ["t0", ["t0", "l0", "l0s0", "l0t0", "l0s1", "te"]],
      ["l0", ["l0", "l0s0", "l0t0", "l0s1", "te"]],
      ["l0s0", ["l0s0", "l0t0", "l0s1", "te"]],
      ["l0t0", ["l0t0", "l0s1", "te"]],
      ["l0s1", ["l0s1", "te"]],
      ["te", ["te"]],
    ] as [TENodeID, TENodeID[]][];

    patterns.forEach(([startNodeId, expectResults]) => {
      const results = [] as TENodeID[];

      walkForwardNodes(nodeMap, startNodeId, node => {
        results.push(node.id);
      });

      expect(results).toEqual(expectResults);
    });
  });

  test("Terminate traverse if specified condition is matched", () => {
    const nodeMap = new NodeMap({});

    nodeMap.createRootNode("root");
    nodeMap.appendChild("root", U.text("t0", "a"));
    nodeMap.appendChild("root", U.text("t1", "b"));
    nodeMap.appendChild("root", U.text("t2", "c"));
    nodeMap.appendChild("root", U.end("te"));

    const results = [] as TENodeID[];

    walkForwardNodes(nodeMap, "t0", node => {
      results.push(node.id);
      return node.id === "t1";
    });

    expect(results).toEqual(["t0", "t1"]);
  });
});

describe("walkBackwardNodes", () => {
  test("Start traverse from specified node ID", () => {
    const nodeMap = new NodeMap({});

    nodeMap.createRootNode("root");
    nodeMap.appendChild("root", U.text("t0", "abc"));
    nodeMap.appendChild("root", U.link("l0"));
    nodeMap.appendChild("l0", U.sentinel("l0s0"));
    nodeMap.appendChild("l0", U.text("l0t0", "def"));
    nodeMap.appendChild("l0", U.sentinel("l0s1"));
    nodeMap.appendChild("root", U.end("te"));

    const PATH = ["root", "t0", "l0", "l0s0", "l0t0", "l0s1", "te"];

    PATH.forEach((startNodeId, i) => {
      const results = [] as TENodeID[];

      walkBackwardNodes(nodeMap, startNodeId, node => {
        results.push(node.id);
      });

      expect(results).toEqual(PATH.slice(0, i + 1).reverse());
    });
  });

  test("Terminate traverse if specified condition is matched", () => {
    const nodeMap = new NodeMap({});

    nodeMap.createRootNode("root");
    nodeMap.appendChild("root", U.text("t0", "a"));
    nodeMap.appendChild("root", U.text("t1", "b"));
    nodeMap.appendChild("root", U.text("t2", "c"));
    nodeMap.appendChild("root", U.end("te"));

    const results = [] as TENodeID[];

    walkBackwardNodes(nodeMap, "t2", node => {
      results.push(node.id);
      return node.id === "t1";
    });

    expect(results).toEqual(["t2", "t1"]);
  })
});