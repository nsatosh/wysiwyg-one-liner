import { TETextNode, TELeafNode } from "../../src";

type TextLeafNode = TETextNode & TELeafNode;

export type TENodeStyleName = "bold" | "italic" | "underline" | "strikethrough";

export type TETextStyles = { [name in TENodeStyleName]?: boolean };

export interface StyledTextNode extends TextLeafNode {
  style: TETextStyles;
}
