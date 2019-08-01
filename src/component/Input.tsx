import React, { FC, useCallback, useEffect, useReducer, useRef } from "react";
import styled from "styled-components";
import { ModifySelectionCommand } from "../core/commands/ModifySelectionCommand";
import { StartEditCommand } from "../core/commands/StartEditCommand";
import EditorCommand from "../core/EditorCommand";
import { invokeCommand } from "../core/invokeCommand";
import { getLastLeaf } from "../core/nodeFinders";
import NodeMap from "../core/NodeMap/NodeMap";
import { TEEditor, TEParentNode } from "../core/types";
import { DragAndDropCallback, useDragAndDrop } from "../service/DragAndDrop";
import { DispatchEditorCommandContext } from "../service/EditorCommandDispatcher";
import { TextPositionContext } from "../service/TextPosition";
import { TextPositionRegistry } from "../service/TextPositionRegistry";
import Cursor from "./Cursor";
import { GlobalCSS } from "./GlobalCSS";
import { Line } from "./Line";
import Range from "./Range";

const ContainerBlock = styled.div`
  position: relative;
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
  onInput?: (value: TEEditor) => void;
}

export const Input: FC<Props> = props => {
  const { onChange, onInput, defaultValue } = props;
  const prevEditor = useRef(defaultValue);
  const [editor, dispatchCommand] = useReducer(reducer, defaultValue);

  useEffect(() => {
    if (onInput && prevEditor.current.nodeMap !== editor.nodeMap) {
      onInput(editor);
    }

    if (onChange) {
      onChange(editor);
    }

    prevEditor.current = editor;
  }, [editor, onChange, prevEditor]);

  const {
    nodeSchema,
    nodeMap,
    rootNodeId,
    selection,
    cursorAt,
    compositionRange,
    compositionFocusedRange
  } = editor;

  const containerRef = useRef<HTMLDivElement>(null);
  const dummyTextRef = useRef<HTMLSpanElement>(null);
  const TPR = useRef<TextPositionRegistry>(
    new TextPositionRegistry(nodeSchema, containerRef, dummyTextRef)
  );

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

  useDragAndDrop(TPR, onDragAndDrop);

  return (
    <DispatchEditorCommandContext.Provider value={dispatchCommand}>
      <TextPositionContext.Provider value={TPR.current}>
        <GlobalCSS />
        <div>
          <ContainerBlock ref={containerRef}>
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

            <Line node={nodeMap[rootNodeId] as TEParentNode} editor={editor} />

            {cursorAt && <Cursor editor={editor} />}
          </ContainerBlock>

          <DummyTextDiv>
            <DummyTextSpan ref={dummyTextRef} />
          </DummyTextDiv>
        </div>
      </TextPositionContext.Provider>
    </DispatchEditorCommandContext.Provider>
  );
};
