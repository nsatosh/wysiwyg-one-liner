import React, { FC, useCallback, useContext, useEffect, useRef } from "react";
import {
  combineCommands,
  EndCompositionCommand,
  PasteCommand,
  ReplaceTextCommand,
  StartCompositionCommand,
  TEEditor,
  UpdateCursorInComposition
} from "../core";
import { DispatchEditorCommandContext } from "../service/EditorCommandDispatcher";
import { findCommand } from "../service/findCommand";
import { TextPositionContext } from "../service/TextPosition";
import styled from "styled-components";

const Textarea = styled.textarea`
  white-space: nowrap;
  line-height: inherit;
  font-size: inherit;
  font-weight: inherit;
  padding: var(--NodePadding) 0;
  margin: 0;
  border: none;
  background-color: var(--Black);
  color: var(--Black);
  cursor: none;
`;

interface Props {
  editor: TEEditor;
}

const noop = () => {};

const Input: FC<Props> = props => {
  const { editor } = props;
  const { cursorAt, isActive } = editor;

  const dispatchCommand = useContext(DispatchEditorCommandContext);
  const TPR = useContext(TextPositionContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (cursorAt && isActive) {
      textareaRef.current!.focus();
    }
  }, [cursorAt, isActive]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        !TPR ||
        event.keyCode === 229 ||
        editor.inComposition ||
        !editor.isActive
      ) {
        return;
      }

      const command = findCommand(editor, event.nativeEvent, TPR);

      if (command) {
        event.preventDefault();

        dispatchCommand(command);
      }
    },
    [editor, dispatchCommand]
  );

  const onInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!editor.inComposition) {
        if (event.target.value.length > 1) {
          dispatchCommand(new PasteCommand(event.target.value));
        } else {
          dispatchCommand(new ReplaceTextCommand(event.target.value));
        }
        return;
      }

      const { value, selectionStart, selectionEnd } = event.target;

      compositionDataRef.current = value;

      dispatchCommand(
        combineCommands(
          new ReplaceTextCommand(value),
          new UpdateCursorInComposition(value, selectionStart, selectionEnd)
        )
      );
    },
    [editor.inComposition, dispatchCommand]
  );

  const compositionDataRef = useRef("");

  const onCompositionStart = useCallback(() => {
    dispatchCommand(new StartCompositionCommand());
  }, [dispatchCommand]);

  const onCompositionEnd = useCallback(() => {
    compositionDataRef.current = "";
    dispatchCommand(new EndCompositionCommand());
  }, [dispatchCommand, compositionDataRef]);

  return (
    <Textarea
      ref={textareaRef}
      rows={1}
      value={compositionDataRef.current}
      onKeyDown={onKeyDown}
      onChange={noop}
      onInput={onInput}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
    />
  );
};

export default Input;
