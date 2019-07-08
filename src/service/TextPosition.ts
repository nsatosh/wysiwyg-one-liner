import { TEBaseNode } from "../core";
import React, { useContext, useLayoutEffect, useRef } from "react";
import { TextPositionRegistry } from "../service/TextPositionRegistry";

export const TextPositionContext = React.createContext<TextPositionRegistry>(
  new TextPositionRegistry()
);

export function usePositionRegistry(node: TEBaseNode) {
  const context = useContext(TextPositionContext);
  const ref = useRef<any>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    context.registerElement(node, ref.current);
  });

  useLayoutEffect(() => {
    return () => {
      context.unregisterElement(node.id);
    };
  }, []);

  return { context, ref };
}
