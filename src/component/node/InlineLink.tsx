import React, { FC, memo } from "react";
import styled from "styled-components";
import { TELeafNode, TELinkNode, TENodeMap } from "../../core";
import InlineSentinel from "./InlineSentinel";
import InlineText from "./InlineText";

const A = styled.a`
  color: blue;
`;

interface Props {
  node: TELinkNode;
  nodeMap: TENodeMap;
  inDebug?: boolean;
}

const InlineLink: FC<Props> = memo(props => {
  const { node, inDebug, nodeMap } = props;

  const nodes = node.children.reduce<TELeafNode[]>((nodes, id) => {
    const node = nodeMap[id];

    if (!node) {
      console.warn(`invalid child found: ${id}`);
      return nodes;
    }

    nodes.push(node as TELeafNode);

    return nodes;
  }, []);

  return (
    <A href={node.url} target="_blank">
      {nodes.map(node => {
        if (node.type === "text") {
          return <InlineText key={node.id} inDebug={inDebug} node={node} />;
        }

        if (node.type === "sentinel") {
          return <InlineSentinel key={node.id} node={node} inDebug={inDebug} />;
        }
      })}
    </A>
  );
});

export default InlineLink;
