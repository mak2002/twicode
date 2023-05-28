import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

export class ScheduledTweetsPanel implements vscode.WebviewViewProvider {
  public static currentPanel: ScheduledTweetsPanel | undefined;
  public readonly viewType = "scheduledTweets";

  private _extensionUri: vscode.Uri;
  public _panel: vscode.WebviewPanel | undefined;

  public constructor(extensionUri: vscode.Uri) {
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
    _context: vscode.WebviewViewResolveContext
  ) {
    this._panel = vscode.window.createWebviewPanel(
      this.viewType,
      "Scheduled Tweets",
      { viewColumn: vscode.ViewColumn.One },
      {
        enableScripts: true,
      }
    );

    this._panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(
          path.join(
            this._extensionUri.fsPath,
            "src",
            "webviews",
            "scheduledTweets"
          )
        ),
      ],
    };

    console.log("Webview view resolved");
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);


    this._panel.webview.onDidReceiveMessage(async (message) => {
      console.log("Received message from webview:", message);
      switch (message.command) {
        case "deleteTweet":
          const tweetId = message.text;
          // await deleteTweet(tweetId);
          vscode.window.showInformationMessage("Tweet deleted: ", tweetId);
          return;
        default:
          return;
      }
    });
  }

  public checkAndCreate(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ScheduledTweetsPanel.currentPanel) {
      ScheduledTweetsPanel.currentPanel._panel?.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      this.viewType,
      "Scheduled Tweets",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    panel.webview.onDidReceiveMessage((message) => {
      console.log("Received message asd:", message);
      switch (message.command) {
        case "deleteTweet":
          // Handle delete functionality for the tweet
          const tweetId = message.text;
          // console.log("Tweet deleted:", tweetId);
          vscode.window.showInformationMessage("Tweet deleted");
          return;
        default:
          return;
      }
    });

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

    ScheduledTweetsPanel.currentPanel = this;
    ScheduledTweetsPanel.currentPanel._panel = panel;

    panel.onDidDispose(() => {
      ScheduledTweetsPanel.currentPanel = undefined;
    });
  }
}
