import React, { FC, memo } from "react";
import styled from "styled-components";
import { TEBaseNode } from "../../core/types";
import { usePositionRegistry } from "../../service/TextPosition";

const Span = styled.span`
  white-space: pre;
`;

interface Props {
  node: TEBaseNode;
  inDebug?: boolean;
}

const InlineSentinel: FC<Props> = memo(props => {
  const { ref } = usePositionRegistry(props.node);

  return <Span ref={ref}>{props.inDebug ? "■" : " "}</Span>;
});

export default InlineSentinel;
