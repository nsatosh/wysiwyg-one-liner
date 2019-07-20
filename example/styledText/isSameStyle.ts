import { StyledTextNode } from "./StyledTextNode";

export function isSameStyle(a: StyledTextNode, b: StyledTextNode): boolean {
  return (
    !!a.style.bold === !!b.style.bold &&
    !!a.style.italic === !!b.style.italic &&
    !!a.style.strikethrough === !!b.style.strikethrough &&
    !!a.style.underline === !!b.style.underline
  );
}
