import React, { FC, memo } from "react";
import { TESentinelNode } from "../../core";
import { usePositionRegistry } from "../../service/TextPosition";
import styled from "styled-components";

const Span = styled.span`
  white-space: pre;
`;

interface Props {
  node: TESentinelNode;
  inDebug?: boolean;
}

const InlineSentinel: FC<Props> = memo(props => {
  const { ref } = usePositionRegistry(props.node);

  return <Span ref={ref}>{props.inDebug ? "■" : " "}</Span>;
});

export default InlineSentinel;
