import { TEChildNode, TEEditor } from "../core/types";

export interface CustomNodeProps<T = TEChildNode> {
  editor: TEEditor;
  node: T;
}
