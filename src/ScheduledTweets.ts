import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

export class ScheduledTweetsPanel implements vscode.WebviewViewProvider {
  public static currentPanel: ScheduledTweetsPanel | undefined;

  public static readonly viewType = "scheduledTweets";
  private _panel: vscode.WebviewPanel;
  private _context: vscode.ExtensionContext;

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this._panel = panel;
    this._context = context;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const htmlPath = path.join(
      this._context.extensionPath,
      "src",
      "webviews",
      "scheduledTweets",
      "tweets.html"
    );
    const htmlContent = fs.readFileSync(htmlPath, { encoding: "utf8" });
    const scriptPath = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(
          this._context.extensionPath,
          "src",
          "webviews",
          "scheduledTweets",
          "tweets.js"
        )
      )
    );

    const modifiedHtmlContent = htmlContent.replace(
      "./tweets.js",
      scriptPath.toString()
    );

    return modifiedHtmlContent;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(
          path.join(
            this._context.extensionPath,
            "src",
            "webviews",
            "scheduledTweets"
          )
        ),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      console.log("message received");
      switch (message.type) {
        case "success":
          vscode.window.showInformationMessage(message.message);
          return;
        case "error":
          vscode.window.showErrorMessage(message.message);
          return;
        case "deleteTweet":
          vscode.window.showInformationMessage("Tweet deleted");
          return;
        default:
          return;
      }
    });
  }

  public static checkAndShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : vscode.ViewColumn.One;

    if (ScheduledTweetsPanel.currentPanel) {
      ScheduledTweetsPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      ScheduledTweetsPanel.viewType,
      "Scheduled Tweets",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    const htmlPath = path.join(
      extensionUri.fsPath,
      "src",
      "webviews",
      "scheduledTweets",
      "tweets.html"
    );
    const htmlContent = fs.readFileSync(htmlPath, { encoding: "utf8" });

    const scriptPath = vscode.Uri.file(
      path.join(
        extensionUri.fsPath,
        "src",
        "webviews",
        "scheduledTweets",
        "tweets.js"
      )
    );

    const modifiedHtmlContent = htmlContent.replace(
      "./tweets.js",
      panel.webview.asWebviewUri(scriptPath).toString()
    );

    panel.webview.html = modifiedHtmlContent;

    panel.onDidDispose(() => {
      ScheduledTweetsPanel.currentPanel = undefined;
    });
  }
}
