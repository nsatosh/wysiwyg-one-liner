import React, { FC, useCallback, useState } from "react";
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
  TEEditor
} from "../../src";
import { NodeSchemaItem } from "../../src/core/NodeSchema";
import console = require("console");

interface TagNode extends TEInternalNode {
  type: "tag";
}

const InlineTag: FC<CustomNodeProps<TagNode>> = props => {
  const { node, editor } = props;
  const { nodeMap, inDebug, nodeSchema } = editor;

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
          return <InlineSentinel key={node.id} node={node} inDebug={inDebug} />;
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

function initializeEditorState() {
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

  return EditorMutator.createFromNodeMap(nodeMap, "root");
}

const INITIAL_EDITOR = initializeEditorState();

const Editor: FC = () => {
  const [tags, changeTags] = useState([] as string[]);

  const onChange = useCallback(
    (next: TEEditor) => {
      const { nodeSchema, nodeMap } = next;
      const tags = [] as string[];

      new NodeMap(nodeSchema, nodeMap).forEach(node => {
        if (node.type === "tag") {
          const { children } = node as TagNode;

          tags.push((nodeMap[children[1]] as TETextNode).text.join(""));
        }
      });

      changeTags(tags);
    },
    [changeTags]
  );

  return (
    <div>
      <div
        style={{
          background: "white",
          borderRadius: 3,
          boxShadow: "2px 2px 2px gray"
        }}
      >
        <Input defaultValue={INITIAL_EDITOR} onChange={onChange} />
      </div>

      <section>
        <h3>Tags</h3>
        <ul>
          {tags.map(tag => {
            return <li key={tag}>{tag}</li>;
          })}
        </ul>
      </section>
    </div>
  );
};

window.addEventListener("load", function() {
  render(<Editor />, document.getElementById("root"));
});
