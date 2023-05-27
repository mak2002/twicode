import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

export class ScheduledTweetsPanel implements vscode.WebviewViewProvider {

  public static currentPanel: ScheduledTweetsPanel | undefined;
  public static readonly viewType = "scheduledTweets";

  // private _panel: vscode.WebviewPanel;
  private _extensionUri: vscode.Uri;

  public constructor(extensionUri: vscode.Uri) {
    // this._panel = panel;
    this._extensionUri = extensionUri;
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const htmlPath = path.join(
      this._extensionUri.fsPath,
      "src",
      "webviews",
      "scheduledTweets",
      "tweets.html"
    );
    const htmlContent = fs.readFileSync(htmlPath, { encoding: "utf8" });
    const scriptPath = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(
          this._extensionUri.fsPath,
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
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(
          path.join(this._extensionUri.fsPath, "src", "webviews", "scheduledTweets")
        ),
      ],
    };
  
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  
    webviewView.webview.onDidReceiveMessage((message) => {
      console.log("Received message from webview:", message);
      switch (message.command) {
        case "deleteTweet":
          // Handle delete functionality for the tweet
          const tweetId = message.tweetId;
          console.log("Tweet deleted:", tweetId);
          vscode.window.showInformationMessage("Tweet deleted");
          return;
        default:
          return;
      }
    });
  }
  

  public static getPanel(): ScheduledTweetsPanel | undefined {
    return ScheduledTweetsPanel.currentPanel;
  }

  public static checkAndShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : vscode.ViewColumn.One;

    // if (ScheduledTweetsPanel.currentPanel) {
    //   ScheduledTweetsPanel.currentPanel._panel.reveal(column);
    //   return;
    // }

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

    ScheduledTweetsPanel.currentPanel = new ScheduledTweetsPanel(extensionUri);

    panel.onDidDispose(() => {
      ScheduledTweetsPanel.currentPanel = undefined;
    });
  }
}
