import React, { FC, memo } from "react";
import {
  TEGroupingNode,
  TEBaseNode,
  TENodeMap,
  TETextNode,
  TESentinelNode,
  TEMediaNode
} from "../../core";
import { U } from "../../core/U";
import InlineMedia from "./InlineMedia";
import InlineSentinel from "./InlineSentinel";
import InlineText from "./InlineText";

interface Props {
  node: TEGroupingNode;
  nodeMap: TENodeMap;
  inDebug?: boolean;
}

const InlineGrouping: FC<Props> = memo(props => {
  const { node, inDebug, nodeMap } = props;

  const nodes = node.children.reduce<TEBaseNode[]>((nodes, id) => {
    const node = nodeMap[id];

    if (!node) {
      console.warn(`invalid child found: ${id}`);
      return nodes;
    }

    nodes.push(node);

    return nodes;
  }, []);

  return (
    <span>
      {nodes.map(node => {
        switch (node.type) {
          case "text":
            return (
              <InlineText
                key={node.id}
                inDebug={inDebug}
                node={node as TETextNode}
              />
            );
          case "sentinel":
            return (
              <InlineSentinel
                key={node.id}
                node={node as TESentinelNode}
                inDebug={inDebug}
              />
            );
          case "media":
            return <InlineMedia key={node.id} node={node as TEMediaNode} />;
          case "grouping":
            return (
              <InlineGrouping
                key={node.id}
                nodeMap={nodeMap}
                node={node as TEGroupingNode}
                inDebug={inDebug}
              />
            );
          default:
            return (
              <InlineText
                key={node.id}
                inDebug={inDebug}
                node={U.notSupported(node.id) as TETextNode}
              />
            );
        }
      })}
    </span>
  );
});

export default InlineGrouping;
