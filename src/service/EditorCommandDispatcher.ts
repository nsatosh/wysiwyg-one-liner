import { createContext } from "react";
import EditorCommand from "../core/EditorCommand";

export type DispatchCommand = (command: EditorCommand) => void;

export const DispatchEditorCommandContext = createContext<DispatchCommand>(
  () => {}
);
