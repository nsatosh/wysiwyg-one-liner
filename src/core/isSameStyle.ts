import { TETextNode } from "./types";

export function isSameStyle(a: TETextNode, b: TETextNode): boolean {
  return (
    !!a.style.bold === !!b.style.bold &&
    !!a.style.italic === !!b.style.italic &&
    !!a.style.strikethrough === !!b.style.strikethrough &&
    !!a.style.underline === !!b.style.underline
  );
}
