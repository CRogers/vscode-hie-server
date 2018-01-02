import { LanguageClient, NotificationType0, Diagnostic, PublishDiagnosticsParams, PublishDiagnosticsNotification } from "vscode-languageclient/lib/main";
import { window, DecorationRangeBehavior, ThemeColor, DecorationRenderOptions, DecorationOptions, Range, TextEditorDecorationType } from "vscode";
import { NotificationType1 } from "vscode-jsonrpc";

interface DecorationsPerFile {
  [uri: string]: TextEditorDecorationType[];
}

class TypeHoleDecorator {
  private readonly decorations: DecorationsPerFile = {};

  constructor(
    private readonly langClient: LanguageClient,
    private readonly subscriptions: { dispose(): any }[],
  ) {
    langClient.onReady().then(() => {
      langClient.onNotification(PublishDiagnosticsNotification.type, (diags: PublishDiagnosticsParams) => {
        console.log("diags", diags);
      })
    })
  }

  private addTypeHoleDecoration(diagnosticResponse: PublishDiagnosticsParams) {
    const uri = diagnosticResponse.uri;
    const textEditor = window.visibleTextEditors.find(textEditor => textEditor.document.fileName === uri);
    this.clearAllDecorationForFile(uri);
    
    diagnosticResponse.diagnostics.filter(diagnosticResponse => diagnosticResponse.message)

    const decoration = window.createTextEditorDecorationType({
      isWholeLine: true,
      rangeBehavior: DecorationRangeBehavior.ClosedClosed,
      after: {
        contentText: 'Type hole _: Module -> Data.Text.Internal.Lazy.Text',
        margin: '0 0 0 50px',
        color: new ThemeColor("editorCursor.foreground")
      }
    } as DecorationRenderOptions)

    // textEditor.setDecorations()
  }

  private clearAllDecorationForFile(uri: string) {
    this.decorations[uri].forEach(decoration => decoration.dispose());
  }
}

export function initTypeHoleListener(langClient: LanguageClient) {
  langClient.onReady().then(() => {
    langClient.onNotification(PublishDiagnosticsNotification.type, (diags: PublishDiagnosticsParams) => {
      console.log("diags", diags);
    })
  })

  const decoration = window.createTextEditorDecorationType({
    isWholeLine: true,
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    after: {
      contentText: 'Type hole _: Module -> Data.Text.Internal.Lazy.Text',
      margin: '0 0 0 50px',
      color: new ThemeColor("editorCursor.foreground")
    }
  } as DecorationRenderOptions)

  const line = 2;

  const decs: DecorationOptions[] = [{ 
    range: new Range(line, 0, line, 5),
    hoverMessage: 'YOLO'
  } as DecorationOptions ];

  const textEditor = window.visibleTextEditors[0];

  console.log(textEditor.document.fileName);
  textEditor.setDecorations(decoration, decs);
}



