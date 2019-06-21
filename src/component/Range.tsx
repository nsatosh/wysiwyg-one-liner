import React, { FC, memo, useContext, useEffect, useRef } from "react";
import {
  getIdsInRange,
  NodeMap,
  TEBaseNode,
  TENodeID,
  TENodeMap,
  TETextRange
} from "../core";
import { TextPositionContext } from "../service/TextPosition";
import { NodeSchema } from "../core/NodeSchema";

type RangeStyle =
  | "selection"
  | "disabledSelection"
  | "composition"
  | "compositionFocused";

interface Props {
  rootNodeId: TENodeID;
  nodeMap: TENodeMap;
  nodeSchema: NodeSchema;
  range: TETextRange;
  style: RangeStyle;
}

const css: { [key in RangeStyle]: React.CSSProperties } = {
  selection: {
    position: "absolute",
    background: "cyan"
  },
  disabledSelection: {
    position: "absolute",
    background: "var(--Gray2)"
  },
  composition: {
    position: "absolute",
    borderBottom: "1px solid var(--Gray4)"
  },
  compositionFocused: {
    position: "absolute",
    borderBottom: "2px solid var(--Gray4)"
  }
};

const Range: FC<Props> = props => {
  const { nodeSchema, nodeMap, range, style } = props;

  const { start, end } = range;
  const nodes = getIdsInRange(new NodeMap(nodeSchema, nodeMap), range).map(
    id => nodeMap[id]!
  );
  const startNode = nodes.shift();
  const endNode = nodes.pop();

  if (!startNode) {
    return null;
  }

  if (!endNode) {
    return (
      <div>
        <RangePart
          node={startNode}
          start={start.ch}
          end={end.ch}
          style={style}
        />
      </div>
    );
  } else {
    return (
      <div>
        <RangePart node={startNode} start={start.ch} style={style} />
        {nodes.map(node => (
          <RangePart key={node.id} node={node} style={style} />
        ))}
        <RangePart
          key={endNode.id}
          node={endNode}
          start={0}
          end={end.ch}
          style={style}
        />
      </div>
    );
  }
};

export default Range;

const MIN_WIDTH = 3; //px
const MIN_HEIGHT = 10; //px

interface PartProps {
  node: TEBaseNode;
  style: RangeStyle;
  start?: number;
  end?: number;
}

const RangePart: FC<PartProps> = memo(props => {
  const context = useContext(TextPositionContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { node, start, end } = props;

    const rect = context.getCoordRect(node.id, start, end);
    const el = ref.current!;

    if (!rect) {
      return;
    }

    el.style.top = `${rect.top}px`;
    el.style.left = `${rect.left}px`;
    el.style.width = `${rect.width || MIN_WIDTH}px`;
    el.style.height = `${rect.height + 1 || MIN_HEIGHT}px`;
  }, [props]);

  return <div ref={ref} style={css[props.style]} />;
});
