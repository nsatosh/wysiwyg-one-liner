import EditorCommand from "../core/EditorCommand";
import { TEEditor } from "../core/types";
import { TextPositionRegistry } from "./TextPositionRegistry";

export function findCommand(
  editor: TEEditor,
  event: KeyboardEvent,
  TPR: TextPositionRegistry
): EditorCommand | undefined {
  const { keybindSettings, commands } = editor;

  if (!keybindSettings) {
    return;
  }

  const keybind = keybindSettings[getKeyFromEvent(event)];

  if (!keybind) {
    return;
  }

  return commands[keybind];
}

function getKeyFromEvent(event: KeyboardEvent) {
  const keys: string[] = [];

  if (event.metaKey) keys.push("Meta");
  if (event.altKey) keys.push("Alt");
  if (event.ctrlKey) keys.push("Ctrl");
  if (event.shiftKey) keys.push("Shift");
  keys.push(event.key);

  return keys.join("+");
}
