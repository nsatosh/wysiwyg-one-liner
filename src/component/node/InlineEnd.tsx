import React, { FC, memo } from "react";
import { usePositionRegistry } from "../../service/TextPosition";
import styled from "styled-components";
import { CustomNodeProps } from "../CustomNodeProps";

const Span = styled.span`
  white-space: pre;
  font-weight: 300;
  font-size: var(--TextFontSize);
`;

const InlineEnd: FC<CustomNodeProps> = memo(props => {
  const { ref } = usePositionRegistry(props.node);

  return <Span ref={ref}>{props.editor.inDebug ? "□" : " "}</Span>;
});

export default InlineEnd;
