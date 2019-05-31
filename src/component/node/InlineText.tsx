import React, { FC, memo } from "react";
import { TETextNode } from "../../core";
import { useLeafNodePositionRegistry } from "../../service/TextPosition";

interface Props {
  node: TETextNode;
  fontSize?: number | string;
  color?: string;
  inDebug?: boolean;
}

const InlineText: FC<Props> = memo(props => {
  const { ref } = useLeafNodePositionRegistry(props.node);

  const { node, fontSize, color, inDebug } = props;
  const { bold, italic, strikethrough, underline } = node.style;

  const style = {
    whiteSpace: "pre",
    fontWeight: bold ? "bold" : 300,
    fontStyle: italic ? "italic" : "normal",
    fontSize: fontSize || "var(--TextFontSize)",
    color: color,
    textDecoration: [
      underline ? "underline" : "",
      strikethrough ? "line-through" : ""
    ].join(" ")
  } as React.CSSProperties;

  return (
    <span ref={ref} style={style}>
      {node.text.join("") || (inDebug ? "□" : " ")}
    </span>
  );
});

export default InlineText;
