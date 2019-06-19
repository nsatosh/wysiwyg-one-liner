import katex from "katex";
import React, { FC, memo, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  TEMathNode,
  TEMode,
  TENodeMap,
  TESentinelNode,
  TETextNode
} from "../../core";
import InlineSentinel from "./InlineSentinel";
import InlineText from "./InlineText";

const Span = styled.span`
  position: relative;
`;

const SpanHover = styled.span`
  position: absolute;
  top: 100%;
  left: 5px;
  color: var(--Gray5);
`;

interface Props {
  node: TEMathNode;
  nodeMap: TENodeMap;
  mode: TEMode;
  inDebug?: boolean;
}

const InlineMath: FC<Props> = memo(props => {
  const { nodeMap, mode, inDebug, node } = props;
  const s0 = nodeMap[node.children[0]];
  const t0 = nodeMap[node.children[1]];
  const s1 = nodeMap[node.children[2]];

  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (t0 && t0.type === "text" && mode === "wysiwyg" && ref.current) {
      katex.render((t0 as TETextNode).text.join(""), ref.current, {
        throwOnError: false
      });
    }
  }, [mode, t0]);

  if (
    !s0 ||
    !t0 ||
    !s1 ||
    s0.type !== "sentinel" ||
    t0.type !== "text" ||
    s1.type !== "sentinel"
  ) {
    return null;
  }

  return (
    <Span>
      <InlineSentinel
        key={s0.id}
        node={s0 as TESentinelNode}
        inDebug={inDebug}
      />
      {mode === "plain" ? (
        <span key="plain">
          <InlineText key={t0.id} inDebug={inDebug} node={t0 as TETextNode} />
          <InlineSentinel
            key={s1.id}
            node={s1 as TESentinelNode}
            inDebug={inDebug}
          />
        </span>
      ) : (
        <span key="wysiwyg">
          <span ref={ref} />
          <SpanHover>
            <InlineText key={t0.id} inDebug={inDebug} node={t0 as TETextNode} />
            <InlineSentinel
              key={s1.id}
              node={s1 as TESentinelNode}
              inDebug={inDebug}
            />
          </SpanHover>
        </span>
      )}
    </Span>
  );
});

export default InlineMath;
