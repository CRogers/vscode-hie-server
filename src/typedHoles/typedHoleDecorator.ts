import { LanguageClient, NotificationType0, Diagnostic, PublishDiagnosticsParams, PublishDiagnosticsNotification, Range as LspRange } from "vscode-languageclient/lib/main";
import { window, DecorationRangeBehavior, ThemeColor, DecorationRenderOptions, DecorationOptions, Range, TextEditorDecorationType, Disposable } from "vscode";
import { NotificationType1 } from "vscode-jsonrpc";
import { isTypedHole, TypedHole } from "./typedHoles";

interface DecorationsPerFile {
  [uri: string]: TextEditorDecorationType[];
}

export class TypedHoleDecorator implements Disposable {
  private readonly decorations: DecorationsPerFile = {};

  constructor(
    private readonly langClient: LanguageClient,
  ) {}

  public start(): Disposable {
    this.langClient.onReady().then(() => {
      this.langClient.onNotification(PublishDiagnosticsNotification.type, (diags: PublishDiagnosticsParams) => {
        this.addTypeHoleDecoration(diags);
      });
    });
    
    return this;
  }

  private addTypeHoleDecoration(diagnosticResponse: PublishDiagnosticsParams) {
    const uri = diagnosticResponse.uri;
    const textEditor = window.visibleTextEditors.find(textEditor => textEditor.document.uri.toString() === uri);
    this.clearAllDecorationForFile(uri);
    
    const decorations = diagnosticResponse.diagnostics
      .map(diagnostic => { return {
        decorationType: mapOptional(isTypedHole(diagnostic.message), decorationFor),
        range: diagnostic.range,
        message: diagnostic.message,
      }})
      .filter(possibleHole => possibleHole.decorationType !== null);

    decorations.forEach(decoration => textEditor.setDecorations(decoration.decorationType, [{
      range: convertRange(decoration.range),
      hoverMessage: {
        language: 'text',
        value: decoration.message
      }
    }]));

    this.decorations[uri] = decorations.map(decoration => decoration.decorationType);
  }

  private clearAllDecorationForFile(uri: string) {
    const decorationsForUri = this.decorations[uri];

    if (decorationsForUri === undefined) {
      return;
    }

    decorationsForUri.forEach(decoration => decoration.dispose());
  }

  public dispose() {
    for (const uri in this.decorations) {
      if (this.decorations.hasOwnProperty(uri)) {
        this.clearAllDecorationForFile(uri);
      }
    }
  }
}

function mapOptional<T, R>(item: T | null, func: (t: T) => R): R | null {
  if (item === null) {
    return null;
  }

  return func(item);
}

function convertRange(lspRange: LspRange): Range{
  return new Range(lspRange.start.line, lspRange.start.character, lspRange.end.line, lspRange.end.character);
}

function decorationFor(typedHoleError: TypedHole) {
  return window.createTextEditorDecorationType({
    isWholeLine: true,
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    after: {
      contentText: `Type hole ${typedHoleError.name}: ${typedHoleError.type}`,
      margin: '0 0 0 50px',
      color: new ThemeColor("editorCursor.foreground")
    }
  } as DecorationRenderOptions);
}
