import React, { FC, memo } from "react";
import { TETextNode } from "../../core/types";
import { usePositionRegistry } from "../../service/TextPosition";
import { CustomNodeProps } from "../CustomNodeProps";

const InlineText: FC<CustomNodeProps<TETextNode>> = memo(props => {
  const { ref } = usePositionRegistry(props.node);

  const {
    node,
    editor: { inDebug }
  } = props;

  return <span ref={ref}>{node.text.join("") || (inDebug ? "□" : " ")}</span>;
});

export default InlineText;
