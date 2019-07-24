import React, { FC } from "react";
import { render } from "react-dom";
import {
  EditorMutator,
  NodeMap,
  NodeSchema,
  BUILTIN_ITEMS,
  Content
} from "../../src";
import { StyledTextNode } from "./StyledTextNode";

const Editor: FC = () => {
  const nodeSchema = new NodeSchema(BUILTIN_ITEMS);

  const nodeMap = new NodeMap(nodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild<StyledTextNode>("root", {
    type: "text",
    text: "hello".split(""),
    style: {}
  });
  nodeMap.appendChild<StyledTextNode>("root", {
    type: "text",
    text: "world".split(""),
    style: { bold: true }
  });
  nodeMap.appendChild("root", {
    type: "end"
  });
  const editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  return (
    <div style={{ width: 800, height: 600 }}>
      <Content defaultValue={editor} />
    </div>
  );
};

window.addEventListener("load", function() {
  render(<Editor />, document.getElementById("root"));
});
