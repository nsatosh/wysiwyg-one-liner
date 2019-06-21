import React, { FC, useCallback, useEffect, useReducer, useRef } from "react";
import styled from "styled-components";
import {
  EditorCommand,
  getLastLeaf,
  invokeCommand,
  ModifySelectionCommand,
  NodeMap,
  StartEditCommand,
  TEEditor,
  TERowNode
} from "../core";
import { DragAndDropCallback, useDragAndDrop } from "../service/DragAndDrop";
import { DispatchEditorCommandContext } from "../service/EditorCommandDispatcher";
import { TextPositionContext } from "../service/TextPosition";
import { TextPositionRegistry } from "../service/TextPositionRegistry";
import Cursor from "./Cursor";
import { GlobalCSS } from "./GlobalCSS";
import { Line } from "./Line";
import Range from "./Range";

const ContainerDiv = styled.div`
  height: 100%;
`;

const DummyTextDiv = styled.div`
  width: 0;
  height: 0;
  overflow: hidden;
`;

const DummyTextSpan = styled.span`
  white-space: pre;
`;

const reducer = (state: TEEditor, command: EditorCommand) => {
  return invokeCommand(command, state);
};

interface Props {
  defaultValue: TEEditor;
  onChange?: (value: TEEditor) => void;
}

export const Content: FC<Props> = props => {
  const { onChange, defaultValue } = props;
  const [editor, dispatchCommand] = useReducer(reducer, defaultValue);

  useEffect(() => {
    onChange && onChange(editor);
  }, [editor, onChange]);

  const {
    nodeSchema,
    nodeMap,
    mode,
    inDebug,
    rootNodeId,
    selection,
    cursorAt,
    compositionRange,
    compositionFocusedRange
  } = editor;

  const containerRef = useRef<HTMLDivElement>(null);
  const dummyTextRef = useRef<HTMLSpanElement>(null);
  const TPR = useRef(new TextPositionRegistry());

  useEffect(() => {
    TPR.current.setDOMElements(containerRef.current!, dummyTextRef.current!);
  }, []);

  const onDragAndDrop = useCallback<DragAndDropCallback>(
    (type, pos, ev) => {
      if (type === "down") {
        if (pos) {
          dispatchCommand(new StartEditCommand(pos.id, pos.ch));
          return false;
        }

        if (ev.target === containerRef.current) {
          const textNode = getLastLeaf(
            new NodeMap(nodeSchema, nodeMap),
            nodeMap[rootNodeId]!
          );
          dispatchCommand(new StartEditCommand(textNode.id, 0));
          return false;
        }
      }

      if (type === "move" && pos) {
        dispatchCommand(new ModifySelectionCommand(pos));
        return false;
      }
    },
    [dispatchCommand, containerRef, nodeMap, rootNodeId]
  );

  useDragAndDrop(TPR.current, onDragAndDrop);

  return (
    <DispatchEditorCommandContext.Provider value={dispatchCommand}>
      <TextPositionContext.Provider value={TPR.current}>
        <GlobalCSS />
        <div>
          <ContainerDiv ref={containerRef}>
            {compositionRange && (
              <Range
                rootNodeId={rootNodeId}
                nodeSchema={nodeSchema}
                nodeMap={nodeMap}
                range={compositionRange}
                style={"composition"}
              />
            )}

            {compositionFocusedRange && (
              <Range
                rootNodeId={rootNodeId}
                nodeSchema={nodeSchema}
                nodeMap={nodeMap}
                range={compositionFocusedRange}
                style={"compositionFocused"}
              />
            )}

            {selection && (
              <Range
                rootNodeId={rootNodeId}
                nodeSchema={nodeSchema}
                nodeMap={nodeMap}
                range={selection}
                style={cursorAt ? "selection" : "disabledSelection"}
              />
            )}

            <Line
              node={nodeMap[rootNodeId] as TERowNode}
              nodeMap={nodeMap}
              mode={mode}
              inDebug={inDebug}
            />

            {cursorAt && <Cursor editor={editor} />}
          </ContainerDiv>

          <DummyTextDiv>
            <DummyTextSpan ref={dummyTextRef} />
          </DummyTextDiv>
        </div>
      </TextPositionContext.Provider>
    </DispatchEditorCommandContext.Provider>
  );
};
