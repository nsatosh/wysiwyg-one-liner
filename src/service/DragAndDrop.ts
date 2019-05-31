import { TENonCanonicalTextPosition } from "../core";
import { useCallback, useEffect, useRef } from "react";
import { TextPositionRegistry } from "../service/TextPositionRegistry";

export type DragAndDropCallback = (
  type: "down" | "move" | "up",
  pos: TENonCanonicalTextPosition | undefined,
  ev: MouseEvent
) => false | void;

export function useDragAndDrop(
  TPR: TextPositionRegistry,
  callback: DragAndDropCallback
): boolean {
  const TPRRef = useRef(TPR);
  const callbackRef = useRef(callback);
  const isPressingRef = useRef(false);

  const onMouseDown = useCallback(
    (ev: MouseEvent) => {
      isPressingRef.current = true;

      if (
        callbackRef.current(
          "down",
          TPRRef.current.getPositionFromMouseEvent(
            ev.target as HTMLElement,
            ev.clientX
          ),
          ev
        ) === false
      ) {
        ev.preventDefault();
      }
    },
    [TPRRef, isPressingRef, callbackRef]
  );

  const onMouseMove = useCallback(
    (ev: MouseEvent) => {
      if (!isPressingRef.current) {
        return;
      }

      if (
        callbackRef.current(
          "move",
          TPRRef.current.getPositionFromMouseEvent(
            ev.target as HTMLElement,
            ev.clientX
          ),
          ev
        ) === false
      ) {
        ev.preventDefault();
      }
    },
    [TPRRef, isPressingRef, callbackRef]
  );

  const onMouseUp = useCallback(
    (ev: MouseEvent) => {
      isPressingRef.current = false;

      if (
        callbackRef.current(
          "up",
          TPRRef.current.getPositionFromMouseEvent(
            ev.target as HTMLElement,
            ev.clientX
          ),
          ev
        ) === false
      ) {
        ev.preventDefault();
      }
    },
    [TPRRef, isPressingRef, callbackRef]
  );

  useEffect(() => {
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return isPressingRef.current;
}
