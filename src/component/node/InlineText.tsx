import React, { FC, memo } from "react";
import styled from "styled-components";
import { TETextNode } from "../../core/types";
import { usePositionRegistry } from "../../service/TextPosition";
import { CustomNodeProps } from "../CustomNodeProps";

const Span = styled.span`
  white-space: pre;
  font-weight: 300;
  font-size: var(--TextFontSize);
`;

const InlineText: FC<CustomNodeProps<TETextNode>> = memo(props => {
  const { ref } = usePositionRegistry(props.node);

  const {
    node,
    editor: { inDebug }
  } = props;

  return <Span ref={ref}>{node.text.join("") || (inDebug ? "□" : " ")}</Span>;
});

export default InlineText;
