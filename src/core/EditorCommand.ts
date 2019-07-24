import EditorMutator from "./EditorMutator";

export default abstract class EditorCommand {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  public toString(): string {
    return this.name;
  }

  public abstract execute(editor: EditorMutator): void;
}
