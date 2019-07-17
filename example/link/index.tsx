import React, { FC } from "react";
import { render } from "react-dom";
import { Content } from "../../src/component/Content";
import {
  EditorMutator,
  NodeMap,
  TETextNode,
  TEBaseNode,
  TENodeID,
  TELeafNode
} from "../../src/core";
import { NodeSchema } from "../../src/core/NodeSchema";
import InlineText from "../../src/component/node/InlineText";
import InlineSentinel from "../../src/component/node/InlineSentinel";
import {
  BUILTIN_ITEMS,
  SentinelNodeType
} from "../../src/core/BuiltinNodeSchema";
import { CustomNodeProps } from "../../src/component/CustomNodeProps";

interface TELinkNode extends TEBaseNode {
  type: "link";

  children: TENodeID[];

  url: string;

  parent: TENodeID;
}

const InlineLink: FC<CustomNodeProps<TELinkNode>> = props => {
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
    <a href={node.url} target="_blank">
      {nodes.map(node => {
        if (nodeSchema.isTextNode(node)) {
          return <InlineText key={node.id} node={node} editor={editor} />;
        }

        if (node.type === SentinelNodeType) {
          return <InlineSentinel key={node.id} node={node} inDebug={inDebug} />;
        }
      })}
    </a>
  );
};

const Editor: FC = () => {
  const nodeSchema = new NodeSchema([
    ...BUILTIN_ITEMS,
    {
      type: "link",
      category: "internal",
      isBlockNode: false,
      isInternalNode: true,
      getLength: () => undefined,
      getText: () => undefined,
      canHaveCursor: false,
      component: InlineLink
    }
  ]);

  const nodeMap = new NodeMap(nodeSchema, {});
  nodeMap.createRootNode("root");

  const { id } = nodeMap.appendChild<TELinkNode>("root", {
    type: "link",
    url: "https://example.com"
  });
  nodeMap.appendChild(id, { type: SentinelNodeType });
  nodeMap.appendChild<TETextNode>(id, {
    type: "text",
    text: "A link to example.com".split(""),
    style: {}
  });
  nodeMap.appendChild(id, { type: SentinelNodeType });
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
