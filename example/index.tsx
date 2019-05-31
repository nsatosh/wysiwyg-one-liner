import React, { FC } from "react";
import { render } from "react-dom";
import { Content } from "../src/component/Content";
import { EditorMutator, NodeMap } from "../src/core";
import { U } from "../src/core/U";

const Editor: FC = () => {
  const nodeMap = new NodeMap({});
  nodeMap.createRootNode("root");
  nodeMap.appendChild("root", U.text("t1", "hello", { style: { bold: true } }));
  nodeMap.appendChild("root", U.text("t2", "world"));
  nodeMap.appendChild("root", U.end("t3"));
  const editor = EditorMutator.createExistingEditorState(nodeMap, "root");

  return (
    <div style={{ width: 800, height: 600 }}>
      <Content defaultValue={editor} />
    </div>
  );
};

window.addEventListener("load", function () {
  render(<Editor />, document.getElementById("root"));
});
