import { LanguageClient, NotificationType0, Diagnostic, PublishDiagnosticsParams, PublishDiagnosticsNotification, Range as LspRange } from "vscode-languageclient/lib/main";
import { window, DecorationRangeBehavior, ThemeColor, DecorationRenderOptions, DecorationOptions, Range, TextEditorDecorationType, Disposable, TextEditor } from "vscode";
import { NotificationType1 } from "vscode-jsonrpc";
import { isTypedHole, TypedHole } from "./typedHoles";
import { DecorationsPerFile } from "./decorationManagement";

export class TypedHoleDecorator implements Disposable {
  private readonly decorations: DecorationsPerFile = new DecorationsPerFile();

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
    
    const decorations = diagnosticResponse.diagnostics
      .map(diagnostic => { return {
        decorationType: mapOptional(isTypedHole(diagnostic.message), decorationFor),
        range: convertRange(diagnostic.range)
      }})
      .filter(possibleHole => possibleHole.decorationType !== null);

    this.decorations.get(diagnosticResponse.uri).setDecorations(decorations)
  }

  public dispose() {
    this.decorations.dispose();
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
