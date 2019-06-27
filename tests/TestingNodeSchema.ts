import { BUILTIN_ITEMS } from "../src/core/BuiltinNodeSchema";
import { NodeSchema } from "../src/core/NodeSchema";

export const TestingNodeSchema = new NodeSchema([
  ...BUILTIN_ITEMS,
  {
    type: "link",
    category: "internal",
    isBlockNode: false,
    isInlineContainerNode: true,
    getLength: () => undefined,
    getText: () => undefined,
    canHaveCursor: false
  }
]);
