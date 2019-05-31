import React, { FC } from "react";
import { TEMediaNode } from "../../core";
import { useLeafNodePositionRegistry } from "../../service/TextPosition";
import styled from "styled-components";

const Img = styled.img`
  background: var(--Gray1);
  object-fit: cover;
`;

interface Props {
  node: TEMediaNode;
}

const InlineMedia: FC<Props> = props => {
  const { node } = props;
  const { ref } = useLeafNodePositionRegistry(node);

  return <Img ref={ref} src={node.url} />;
};

export default InlineMedia;
