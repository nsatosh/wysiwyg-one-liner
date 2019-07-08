import React, { FC, memo } from "react";
import { TETextNode } from "../../core";
import { usePositionRegistry } from "../../service/TextPosition";
import { CustomNodeProps } from "../CustomNodeProps";

const InlineText: FC<CustomNodeProps<TETextNode>> = memo(props => {
  const { ref } = usePositionRegistry(props.node);

  const {
    node,
    editor: { inDebug }
  } = props;
  const { bold, italic, strikethrough, underline } = node.style;

  const style = {
    whiteSpace: "pre",
    fontWeight: bold ? "bold" : 300,
    fontStyle: italic ? "italic" : "normal",
    fontSize: "var(--TextFontSize)",
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
