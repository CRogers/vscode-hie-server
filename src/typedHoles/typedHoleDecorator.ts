import { LanguageClient, NotificationType0, Diagnostic, PublishDiagnosticsParams, PublishDiagnosticsNotification, Range as LspRange, Position } from "vscode-languageclient/lib/main";
import { window, DecorationRangeBehavior, ThemeColor, DecorationRenderOptions, DecorationOptions, Range, TextEditorDecorationType, Disposable, TextEditor, DiagnosticCollection } from "vscode";
import { NotificationType1 } from "vscode-jsonrpc";
import { isTypedHole, TypedHole } from "./typedHoles";
import { DecorationsPerFile } from "./decorationManagement";
import { setInterval } from "timers";

export class TypedHoleDecorator implements Disposable {
  private readonly decorationsPerFile: DecorationsPerFile = new DecorationsPerFile();
  private diagnosticCollection: DiagnosticCollection = null;

  constructor() {}

  public start(diagnosticCollection: DiagnosticCollection): Disposable {
    this.diagnosticCollection = diagnosticCollection;
    // this.langClient.onReady().then(() => {
    //   setInterval(() => {
    //     this.updateDecorations();
    //   }, 1000);
    //   // this.langClient.onNotification(PublishDignosticsNotification.type, this.addTypeHoleDecoration.bind(this));
    // });
    
    return this;
  }

  public updateDecorations() {
    if (this.diagnosticCollection == null) {
      return;
    }

    this.diagnosticCollection.forEach((uri, diagnostics) => this.addTypeHoleDecoration({
      uri: uri.toString(),
      diagnostics: diagnostics.map(diag => Diagnostic.create({
        start: Position.create(diag.range.start.line, diag.range.start.character),
        end: Position.create(diag.range.end.line, diag.range.end.character)
      }, diag.message))
    }));
  }

  private addTypeHoleDecoration(diagnosticResponse: PublishDiagnosticsParams) {
    const decorations = diagnosticResponse.diagnostics
      .map(diagnostic => { return {
        decorationType: mapOptional(isTypedHole(diagnostic.message), decorationFor),
        range: convertRange(diagnostic.range)
      }})
      .filter(possibleHole => possibleHole.decorationType !== null);

    this.decorationsPerFile.get(diagnosticResponse.uri).setDecorations(decorations)
  }

  public dispose() {
    this.decorationsPerFile.dispose();
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
      contentText: `Typed hole ${typedHoleError.name}: ${typedHoleError.type}`,
      margin: '0 0 0 50px',
      color: new ThemeColor("editorCursor.foreground")
    }
  } as DecorationRenderOptions);
}
