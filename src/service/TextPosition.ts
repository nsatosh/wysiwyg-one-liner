import React, { useContext, useLayoutEffect, useRef } from "react";
import { TEBaseNode } from "../core/types";
import { TextPositionRegistry } from "../service/TextPositionRegistry";

export const TextPositionContext = React.createContext<TextPositionRegistry | null>(
  null
);

export function usePositionRegistry(node: TEBaseNode) {
  const context = useContext(TextPositionContext);
  const ref = useRef<any>(null);

  useLayoutEffect(() => {
    if (!ref.current || !context) {
      return;
    }

    context.registerElement(node, ref.current);
  });

  useLayoutEffect(() => {
    return () => {
      if (!context) {
        return;
      }

      context.unregisterElement(node.id);
    };
  }, []);

  return { context, ref };
}
