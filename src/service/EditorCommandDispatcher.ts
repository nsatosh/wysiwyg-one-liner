import { EditorCommand } from "../core";
import { createContext } from "react";

export type DispatchCommand = (command: EditorCommand) => void;

export const DispatchEditorCommandContext = createContext<DispatchCommand>(
  () => {}
);
