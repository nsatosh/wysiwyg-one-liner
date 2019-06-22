import { TEEditor, TEChildNode } from "../core";

export interface CustomNodeProps<T = TEChildNode> {
  editor: TEEditor;
  node: T;
}
