import React, { FC, useCallback, useState, useRef, useMemo } from "react";
import { render } from "react-dom";
import {
  EditorMutator,
  NodeMap,
  NodeSchema,
  BUILTIN_ITEMS,
  SentinelNodeType,
  TETextNode,
  TELeafNode,
  CustomNodeProps,
  InlineText,
  InlineSentinel,
  Input,
  TEInternalNode,
  EditorCommand,
  TEChildNode
} from "../../src";
import { NodeSchemaItem } from "../../src/core/NodeSchema";
import console = require("console");

interface TagNode extends TEInternalNode {
  type: "tag";
}

const InlineTag: FC<CustomNodeProps<TagNode>> = props => {
  const { node, editor } = props;
  const { nodeMap, nodeSchema } = editor;

  const nodes = node.children.reduce<TELeafNode[]>((nodes, id) => {
    const node = nodeMap[id];

    if (!node) {
      console.warn(`invalid child found: ${id}`);
      return nodes;
    }

    nodes.push(node as TELeafNode);

    return nodes;
  }, []);

  return (
    <span style={{ padding: 5, border: "1px solid black" }}>
      {nodes.map(node => {
        if (nodeSchema.isTextNode(node)) {
          return <InlineText key={node.id} node={node} editor={editor} />;
        }

        if (node.type === SentinelNodeType) {
          return <InlineSentinel key={node.id} node={node} editor={editor} />;
        }
      })}
    </span>
  );
};

const TAG_SCHEMA: NodeSchemaItem = {
  type: "tag",
  category: "internal",
  isBlockNode: false,
  isInternalNode: true,
  getLength: () => undefined,
  getText: () => undefined,
  canHaveCursor: false,
  component: InlineTag
};

type SubmitCallback = (editor: EditorMutator) => void;

class SubmitCommand extends EditorCommand {
  private callback: SubmitCallback;

  constructor(callback: SubmitCallback) {
    super("SubmitCommand");

    this.callback = callback;
  }

  execute(editor: EditorMutator) {
    this.callback(editor);
  }
}

function initializeEditorState(onSubmit: SubmitCallback) {
  const nodeSchema = new NodeSchema([...BUILTIN_ITEMS, TAG_SCHEMA]);

  const nodeMap = new NodeMap(nodeSchema, {});
  nodeMap.createRootNode("root");

  nodeMap.appendChild<TETextNode>("root", {
    type: "text",
    text: "some keyword".split("")
  });

  {
    const { id } = nodeMap.appendChild<TagNode>("root", {
      type: "tag"
    });
    nodeMap.appendChild(id, { type: SentinelNodeType });
    nodeMap.appendChild<TETextNode>(id, {
      type: "text",
      text: "tag1".split("")
    });
    nodeMap.appendChild(id, { type: SentinelNodeType });
  }

  {
    const { id } = nodeMap.appendChild<TagNode>("root", {
      type: "tag"
    });
    nodeMap.appendChild(id, { type: SentinelNodeType });
    nodeMap.appendChild<TETextNode>(id, {
      type: "text",
      text: "tag2".split("")
    });
    nodeMap.appendChild(id, { type: SentinelNodeType });
  }

  nodeMap.appendChild<TETextNode>("root", {
    type: "text",
    text: "some keyword".split("")
  });

  nodeMap.appendChild("root", {
    type: "end"
  });

  const editor = EditorMutator.createFromNodeMap(nodeMap, "root");

  editor.commands["submit"] = new SubmitCommand(onSubmit);
  editor.keybindSettings["Enter"] = "submit";

  return editor;
}

type ResultType = {
  tags: Set<string>;
  keywords: Set<string>;
};

const Editor: FC = () => {
  const [result, changeResult] = useState<ResultType | undefined>();

  const onSubmit = useCallback(
    (editor: EditorMutator) => {
      const nodeMap = editor.getNodeMap();
      const tags = new Set<string>();
      const keywords = new Set<string>();

      nodeMap.forEach(node => {
        if (node.type === "tag") {
          const { children } = node as TagNode;
          const child = nodeMap.getNode(children[1]);

          if (child && nodeMap.schema.isTextNode(child)) {
            tags.add(child.text.join(""));
          }
        }

        if (node.type === "text") {
          const { parent, text } = node as (TETextNode & TEChildNode);

          if (parent === "root") {
            text
              .join("")
              .split(/\s+/)
              .forEach(word => keywords.add(word));
          }
        }
      });

      changeResult({
        tags,
        keywords
      });
    },
    [changeResult]
  );

  const INITIAL_EDITOR = useMemo(() => initializeEditorState(onSubmit), []);

  return (
    <div>
      <div
        style={{
          background: "white",
          borderRadius: 3,
          boxShadow: "2px 2px 2px gray"
        }}
      >
        <Input defaultValue={INITIAL_EDITOR} />
      </div>

      {result ? (
        <section>
          <h2>Result</h2>
          <h3>Tags:</h3>
          <ul>
            {Array.from(result.tags).map((tag, i) => {
              return <li key={i}>{tag}</li>;
            })}
          </ul>

          <h3>Keywords:</h3>
          <ul>
            {Array.from(result.keywords).map((keyword, i) => {
              return <li key={i}>{keyword}</li>;
            })}
          </ul>
        </section>
      ) : (
        <p>Press Enter to show result</p>
      )}
    </div>
  );
};

window.addEventListener("load", function() {
  render(<Editor />, document.getElementById("root"));
});
