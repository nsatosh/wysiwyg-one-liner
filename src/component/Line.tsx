import React, { FC, useContext, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { TENode, TENodeMap, TEMode, TERowNode, ensureExists } from "../core";
import { TextPositionContext } from "../service/TextPosition";
import InlineLink from "./node/InlineLink";
import InlineMath from "./node/InlineMath";
import InlineMedia from "./node/InlineMedia";
import InlineSentinel from "./node/InlineSentinel";
import InlineText from "./node/InlineText";

const PADDING_LEFT = 10;

const LineDiv = styled.div`
  position: relative;
  line-height: var(--SectionFontSize);
  padding-left: ${PADDING_LEFT}px;
`;

interface Props {
  node: TERowNode;
  nodeMap: TENodeMap;
  mode: TEMode;
  inDebug?: boolean;
}

export const Line: FC<Props> = props => {
  const { node, inDebug, nodeMap, mode } = props;

  const inlineNodes = node.children.map(id => ensureExists(nodeMap[id]));

  const firstNode = inlineNodes[0] as TENode | undefined;
  const lastNode = inlineNodes[inlineNodes.length - 1] as TENode | undefined;
  const firstNodeId = firstNode && firstNode.id;
  const lastNodeId = lastNode && lastNode.id;

  const context = useContext(TextPositionContext);
  const lineRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (firstNodeId) {
      context.registerLineElement(
        firstNodeId,
        lastNodeId || firstNodeId,
        lineRef.current,
        PADDING_LEFT
      );
    }
  }, [firstNodeId, lastNodeId]);

  return (
    <LineDiv ref={lineRef}>
      {inlineNodes.map(node => {
        if (node.type === "text") {
          return <InlineText key={node.id} inDebug={inDebug} node={node} />;
        }

        if (node.type === "media") {
          return <InlineMedia key={node.id} node={node} />;
        }

        if (node.type === "link") {
          return (
            <InlineLink
              key={node.id}
              node={node}
              nodeMap={nodeMap}
              inDebug={inDebug}
            />
          );
        }

        if (node.type === "math") {
          return (
            <InlineMath
              key={node.id}
              mode={mode}
              node={node}
              nodeMap={nodeMap}
              inDebug={inDebug}
            />
          );
        }

        if (node.type === "sentinel") {
          return <InlineSentinel key={node.id} node={node} inDebug={inDebug} />;
        }

        throw new Error(`Unsupported node type: ${node.type}`);
      })}
    </LineDiv>
  );
};
