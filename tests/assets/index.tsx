import React, { FC } from "react";
import { render } from "react-dom";
import { Content } from "../../src/component/Content";
import { EditorMutator, NodeMap, TETextNode } from "../../src/core";
import { U } from "../U";
import { NodeSchema } from "../../src/core/NodeSchema";
import InlineText from "../../src/component/node/InlineText";
import { BUILTIN_ITEMS } from "../../src/core/BuiltinNodeSchema";
import { CustomNodeProps } from "../../src/component/CustomNodeProps";

const CustomTextNode: FC<CustomNodeProps<TETextNode>> = props => {
  const { node } = props;

  return <InlineText node={node} />
};

const Editor: FC = () => {
  let nodeSchema = new NodeSchema(BUILTIN_ITEMS);
  nodeSchema = nodeSchema.setCustomNodeComponent("text", CustomTextNode);

  const nodeMap = new NodeMap(nodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t1", "hello", { style: { bold: true } }));
  nodeMap.appendChild("root", U.text("t2", "world"));
  nodeMap.appendChild("root", U.end("t3"));
  const editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  return (
    <div style={{ width: 800, height: 600 }}>
      <Content defaultValue={editor} />
    </div>
  );
};

window.addEventListener("load", function () {
  render(<Editor />, document.getElementById("root"));
});
