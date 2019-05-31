import React, { FC, memo } from "react";
import { TESentinelNode } from "../../core";
import { useLeafNodePositionRegistry } from "../../service/TextPosition";
import styled from "styled-components";

const Span = styled.span`
  white-space: pre;
`;

interface Props {
  node: TESentinelNode;
  inDebug?: boolean;
}

const InlineSentinel: FC<Props> = memo(props => {
  const { ref } = useLeafNodePositionRegistry(props.node);

  return <Span ref={ref}>{props.inDebug ? "■" : " "}</Span>;
});

export default InlineSentinel;
