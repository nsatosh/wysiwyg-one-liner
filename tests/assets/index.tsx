import React, { FC } from "react";
import { render } from "react-dom";
import { Content } from "../../src/component/Content";
import { EditorMutator, NodeMap, NodeSchema, BUILTIN_ITEMS } from "../../src";
import { U } from "../U";

const Editor: FC = () => {
  const nodeSchema = new NodeSchema(BUILTIN_ITEMS);

  const nodeMap = new NodeMap(nodeSchema, {});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t1", "hello"));
  nodeMap.appendChild("root", U.text("t2", "world"));
  nodeMap.appendChild("root", U.end("t3"));
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
