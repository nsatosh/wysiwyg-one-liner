import React, { FC, memo } from "react";
import styled from "styled-components";
import { usePositionRegistry } from "../../service/TextPosition";
import { CustomNodeProps } from "../CustomNodeProps";

const Span = styled.span`
  white-space: pre;
`;

const InlineSentinel: FC<CustomNodeProps> = memo(props => {
  const { ref } = usePositionRegistry(props.node);

  return <Span ref={ref}>{props.editor.inDebug ? "■" : " "}</Span>;
});

export default InlineSentinel;
