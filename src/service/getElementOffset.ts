interface Offset {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export function getElementOffset(
  baseElement: HTMLElement,
  toElement: HTMLElement
): Offset {
  const rb = baseElement.getBoundingClientRect();
  const rt = toElement.getBoundingClientRect();

  return {
    top: rt.top - rb.top,
    left: rt.left - rb.left,
    bottom: rt.bottom - rb.top,
    right: rt.right - rb.left,
    width: rt.width,
    height: rt.height
  };
}
