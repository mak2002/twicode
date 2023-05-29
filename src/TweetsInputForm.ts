import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

export class TweetsInputForm {
  private _context: any;
  public viewType = "scheduledTweets";

  public constructor(context: vscode.Uri) {
    this._context = context;
  }

  public createWebviewPanel() {
    return vscode.window.createWebviewPanel(
      "myWebview",
      "Input Tweet",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );
  }

  public getHtmlForWebview(
    _context: { extensionPath: string },
    panel: vscode.WebviewPanel
  ): string {
    const htmlPath = path.join(
      _context.extensionPath,
      "src",
      "webviews",
      "tweetInput",
      "input.html"
    );
    const htmlContent = fs.readFileSync(htmlPath, { encoding: "utf8" });

    const scriptPath = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(
          _context.extensionPath,
          "src",
          "webviews",
          "tweetInput",
          "input.js"
        )
      )
    );

    return htmlContent.replace("./input.js", scriptPath.toString());
  }
}
