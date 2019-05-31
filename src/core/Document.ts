import { TERawNodeMap, TENodeMap } from "./types";
import { splitGraphemes } from "split-graphemes";
import { U } from "./U";
import { generateNewId } from "./nodeIdGenerator";
import NodeMap from "./NodeMap/NodeMap";

export function convertRawNodeMapToNodeMap(
  rawNodeMap: TERawNodeMap
): TENodeMap {
  const nodeMap = new NodeMap({});

  for (let id in rawNodeMap) {
    const node = rawNodeMap[id];

    if (!node) {
      console.warn(`empty node mapping found: ${id}`);
      continue;
    }

    if (node.type === "text") {
      nodeMap.setNode(id, {
        ...node,
        text: splitGraphemes(node.text)
      });
    } else {
      nodeMap.setNode(id, node);
    }

    if (node.type === "link") {
      nodeMap.insertBefore(
        nodeMap.ensureNode(node.parent).id,
        U.sentinel(generateNewId()),
        node.id
      );

      nodeMap.appendChild(node.id, U.sentinel(generateNewId()));
    }
  }

  return nodeMap.getValidCurrentState();
}

export function convertNodeMapToRawNodeMap(nodeMap: TENodeMap): TERawNodeMap {
  const rawNodeMap: TERawNodeMap = {};

  for (let id in nodeMap) {
    const node = nodeMap[id];

    if (!node) {
      console.warn(`empty node mapping found: ${id}`);
      continue;
    }

    if (node.type === "sentinel") {
      continue;
    }

    if (node.type === "text") {
      rawNodeMap[id] = {
        ...node,
        text: node.text.join("")
      };
    } else {
      rawNodeMap[id] = { ...node };
    }
  }

  return rawNodeMap;
}
