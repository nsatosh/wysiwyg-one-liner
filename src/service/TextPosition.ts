import { TELeafNode } from "../core";
import React, { useContext, useLayoutEffect, useRef } from "react";
import { TextPositionRegistry } from "../service/TextPositionRegistry";

export const TextPositionContext = React.createContext<TextPositionRegistry>(
  new TextPositionRegistry()
);

export function useLeafNodePositionRegistry(node: TELeafNode) {
  const context = useContext(TextPositionContext);
  const ref = useRef<any>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    context.registerLeafElement(node, ref.current);
  });

  useLayoutEffect(() => {
    return () => {
      context.unregisterLeafElement(node.id);
    };
  }, []);

  return { context, ref };
}
