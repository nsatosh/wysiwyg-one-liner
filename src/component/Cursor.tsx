import { debounce } from "debounce";
import React, {
  FC,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { TEEditor } from "../core";
import { TextPositionContext } from "../service/TextPosition";
import Input from "./Input";
import styled, { keyframes, css } from "styled-components";

const cursorFlicker = keyframes`
0% {
  opacity: 1;
}
50% {
  opacity: 0;
}
`;

const AnimationMixin = css`
  animation: ${cursorFlicker} 1s steps(1) infinite;
`;

const Div = styled.div`
  position: absolute;
  background: #eef;
  position: absolute;
  display: inline-block;
  width: 2px;
  height: var(--SectionFontSize);
  background-color: var(--Black);
  overflow: hidden;
  ${(props: { isFlicking: boolean }) => props.isFlicking && AnimationMixin}
`;

interface Props {
  editor: TEEditor;
}

const Cursor: FC<Props> = props => {
  const context = useContext(TextPositionContext);
  const cursorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { editor } = props;
    const { cursorAt } = editor;

    if (!cursorAt || !context) {
      return;
    }

    const p = context.getCoordPoint(cursorAt);

    if (p) {
      const el = cursorRef.current!;

      el.style.top = `${p.top}px`;
      el.style.left = `${p.left}px`;
    }
  }, [props]);

  const isFlicking = useFlicker(props.editor);

  return (
    <Div ref={cursorRef} isFlicking={isFlicking}>
      <Input editor={props.editor} />
    </Div>
  );
};

function useFlicker(anyEditorState: unknown) {
  const [state, changeState] = useState(false);

  const debouncedChange = useMemo(() => {
    return debounce(() => {
      changeState(true);
    }, 100);
  }, [changeState]);

  useEffect(() => {
    changeState(false);

    debouncedChange();
  }, [anyEditorState]);

  return state;
}

export default Cursor;
