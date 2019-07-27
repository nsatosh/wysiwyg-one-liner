import React, { FC, useCallback, useState } from "react";
import { render } from "react-dom";
import {
  EditorMutator,
  NodeMap,
  NodeSchema,
  BUILTIN_ITEMS,
  Input,
  walkForwardNodes,
  TEEditor
} from "../../src";
import { StyledTextNode } from "./StyledTextNode";
import { ToggleTextStyleCommand } from "./ToggleTextStyleCommand";
import InlineStyledText from "./InlineStyledText";

function initializeEditorState() {
  BUILTIN_ITEMS.find(
    item => item.type === "text"
  )!.component = InlineStyledText;

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

  editor.commands = {
    ...editor.commands,
    bold: new ToggleTextStyleCommand("bold"),
    italic: new ToggleTextStyleCommand("italic"),
    underline: new ToggleTextStyleCommand("underline"),
    strikethrough: new ToggleTextStyleCommand("strikethrough")
  };

  editor.keybindSettings = {
    ...editor.keybindSettings!,
    "Ctrl+b": "bold",
    "Ctrl+i": "italic",
    "Ctrl+u": "underline",
    "Ctrl+t": "strikethrough"
  };

  return editor;
}

const INITIAL_EDITOR = initializeEditorState();

const Editor: FC = () => {
  const [output, changeOutput] = useState("");

  const onChange = useCallback((nextEditor: TEEditor) => {
    const { nodeSchema, nodeMap, rootNodeId } = nextEditor;
    let texts = [] as string[];

    walkForwardNodes(new NodeMap(nodeSchema, nodeMap), rootNodeId, node => {
      if (nodeSchema.isTextNode(node)) {
        texts = texts.concat(node.text);
      }
    });

    changeOutput(texts.join(""));
  }, []);

  return (
    <div style={{ width: 800, height: 600 }}>
      <Input defaultValue={INITIAL_EDITOR} onChange={onChange} />

      <p>Output: {output}</p>
    </div>
  );
};

window.addEventListener("load", function() {
  render(<Editor />, document.getElementById("root"));
});
