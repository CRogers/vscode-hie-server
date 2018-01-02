import { Disposable, TextEditorDecorationType, TextEditor, window, Range } from "vscode";

interface DecorationsPerFileMap {
  [uri: string]: SingleFileDecorations;
}

interface DecorationInstance {
  decorationType: TextEditorDecorationType;
  range: Range;
}

export class DecorationsPerFile implements Disposable {
  private readonly decorationsPerFile: DecorationsPerFileMap = {};

  public get(uri: string): SingleFileDecorations {
    if (this.decorationsPerFile[uri] == null) {
      this.decorationsPerFile[uri] = new SingleFileDecorations(uri);
    }

    return this.decorationsPerFile[uri];
  }

  public dispose() {
    for (const uri in this.decorationsPerFile) {
      if (this.decorationsPerFile.hasOwnProperty(uri)) {
        this.decorationsPerFile[uri].dispose();
      }
    }
  }
}

class SingleFileDecorations implements Disposable {
  private decorationTypes: TextEditorDecorationType[] = [];

  constructor(
    private readonly uri: string
  ) {}

  public setDecorations(decorations: DecorationInstance[]) {
    this.clearAllDecorationsTypes();

    const textEditor = this.textEditor();
    decorations.forEach(decoration => textEditor.setDecorations(decoration.decorationType, [decoration.range]));

    this.decorationTypes = decorations.map(decoration => decoration.decorationType);
  }

  private textEditor(): TextEditor {
    return window.visibleTextEditors.find(textEditor => textEditor.document.uri.toString() === this.uri);
  }

  private clearAllDecorationsTypes() {
    this.decorationTypes.forEach(decorationType => decorationType.dispose());
    this.decorationTypes = []
  }

  public dispose() {
    this.clearAllDecorationsTypes();
  }
}