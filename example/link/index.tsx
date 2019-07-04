import React, { FC } from "react";
import { render } from "react-dom";
import { Content } from "../../src/component/Content";
import {
  EditorMutator,
  NodeMap,
  TETextNode,
  TEBaseNode,
  TENodeID,
  TELeafNode,
  TESentinelNode
} from "../../src/core";
import { NodeSchema } from "../../src/core/NodeSchema";
import InlineText from "../../src/component/node/InlineText";
import InlineSentinel from "../../src/component/node/InlineSentinel";
import { BUILTIN_ITEMS } from "../../src/core/BuiltinNodeSchema";
import { CustomNodeProps } from "../../src/component/CustomNodeProps";

interface TELinkNode extends TEBaseNode {
  type: "link";

  children: TENodeID[];

  url: string;

  parent: TENodeID;
}

const InlineLink: FC<CustomNodeProps<TELinkNode>> = props => {
  const { node, editor } = props;
  const { nodeMap, inDebug } = editor;

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
        if (node.type === "text") {
          return (
            <InlineText
              key={node.id}
              node={node as TETextNode}
              editor={editor}
            />
          );
        }

        if (node.type === "sentinel") {
          return (
            <InlineSentinel
              key={node.id}
              node={node as TESentinelNode}
              inDebug={inDebug}
            />
          );
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
      isInlineContainerNode: true,
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
  nodeMap.appendChild<TESentinelNode>(id, { type: "sentinel" });
  nodeMap.appendChild<TETextNode>(id, {
    type: "text",
    text: "A link to example.com".split(""),
    style: {}
  });
  nodeMap.appendChild<TESentinelNode>(id, { type: "sentinel" });
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
