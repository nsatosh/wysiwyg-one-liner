import EditorCommand from "../core/EditorCommand";
import { TEEditor } from "../core/types";
import { CommandSelector } from "./commandSelector/CommandSelector";
import { keybindableCommands } from "./KeybindableCommands";
import { TextPositionRegistry } from "./TextPositionRegistry";

export function findCommand(
  editor: TEEditor,
  event: KeyboardEvent,
  TPR: TextPositionRegistry
): EditorCommand | undefined {
  const { keybindSettings } = editor;

  if (!keybindSettings) {
    return;
  }

  const keybind = keybindSettings[getKeyFromEvent(event)];

  if (!keybind) {
    return;
  }

  let command = keybindableCommands[keybind];

  if (command && command instanceof CommandSelector) {
    return command.select(editor, TPR);
  }

  return command;
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
