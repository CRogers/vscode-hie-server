import { LanguageClient } from "vscode-languageclient/lib/main";
import { window, DecorationRangeBehavior, ThemeColor, DecorationRenderOptions, DecorationOptions, Range } from "vscode";

export function initTypeHoleListener(langClient: LanguageClient) {
  langClient.onReady().then(() => {
    langClient.onNotification("textDocument/publishDiagnostics", (diags) => {
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