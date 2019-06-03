import { NodeMap } from "../src/core";
import { getCanonicalTextPosition } from "../src/core/position";
import { U } from "../src/core/U";

test("Get canonical position from branch node", () => {
  const nodeMap = new NodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.end("te"));

  expect(getCanonicalTextPosition(nodeMap, { id: "root", ch: 0 })).toEqual({
    id: "te",
    ch: 0
  });

  expect(getCanonicalTextPosition(nodeMap, { id: "te", ch: 0 })).toEqual({
    id: "te",
    ch: 0
  });

  nodeMap.unshiftChild("root", U.text("t0", "abc"));

  expect(getCanonicalTextPosition(nodeMap, { id: "root", ch: 2 })).toEqual({
    id: "t0",
    ch: 2
  });

  expect(getCanonicalTextPosition(nodeMap, { id: "t0", ch: 2 })).toEqual({
    id: "t0",
    ch: 2
  });

  expect(getCanonicalTextPosition(nodeMap, { id: "t0", ch: 3 })).toEqual({
    id: "te",
    ch: 0
  });
});

test("Get undefined if specified position is out of range", () => {
  const nodeMap = new NodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.end("te"));

  expect(
    getCanonicalTextPosition(nodeMap, { id: "t0", ch: 999 })
  ).toBeUndefined();

  expect(
    getCanonicalTextPosition(nodeMap, { id: "t0", ch: -1 })
  ).toBeUndefined();
});

test("Get a position that is at neighbor leaf node", () => {
  const nodeMap = new NodeMap({});

  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t0", "abc"));
  nodeMap.appendChild("root", U.text("t1", "def"));
  nodeMap.appendChild("root", U.end("te"));

  expect(getCanonicalTextPosition(nodeMap, { id: "t0", ch: 5 })).toEqual({
    id: "t1",
    ch: 2
  });
});