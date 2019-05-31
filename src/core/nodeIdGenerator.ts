import { TENodeID } from "./types";

let n = 1;

export function generateNewId(): TENodeID {
  return `${n++}`;
}
