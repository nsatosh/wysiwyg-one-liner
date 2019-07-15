import React, { FC, useContext, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import {
  ensureExists,
  TEBaseNode,
  TEEditor,
  TEChildNode,
  TEParentNode
} from "../core";
import { TextPositionContext } from "../service/TextPosition";
import { CustomNodeProps } from "./CustomNodeProps";

const PADDING_LEFT = 10;

const LineDiv = styled.div`
  position: relative;
  line-height: var(--SectionFontSize);
  padding-left: ${PADDING_LEFT}px;
`;

interface Props {
  node: TEParentNode;
  editor: TEEditor;
}

export const Line: FC<Props> = props => {
  const { node, editor } = props;
  const { nodeMap } = editor;

  const inlineNodes = node.children.map(
    id => ensureExists(nodeMap[id]) as TEChildNode
  );

  const firstNode = inlineNodes[0] as TEBaseNode | undefined;
  const lastNode = inlineNodes[inlineNodes.length - 1] as
    | TEBaseNode
    | undefined;
  const firstNodeId = firstNode && firstNode.id;
  const lastNodeId = lastNode && lastNode.id;

  const context = useContext(TextPositionContext);
  const lineRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (context && firstNodeId) {
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
        const { nodeSchema } = editor;
        const Component = nodeSchema.getCustomNodeComponent(node) as
          | React.ComponentClass<CustomNodeProps>
          | undefined;

        if (!Component) {
          console.error(`Can't render node: ${node.type.toString()}`);
          return null;
        }

        return <Component key={node.id} editor={editor} node={node} />;
      })}
    </LineDiv>
  );
};
