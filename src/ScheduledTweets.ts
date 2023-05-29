import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";
import { client } from "./server/DbClient";

export class ScheduledTweetsPanel {
  private _context: any;
  public viewType = "scheduledTweets";

  public constructor(context: vscode.Uri) {
    this._context = context;
  }

  public getHtmlForWebview(
    _context: { extensionPath: string },
    panel: vscode.WebviewPanel
  ): string {
    const htmlPath = path.join(
      _context.extensionPath,
      "src",
      "webviews",
      "scheduledTweets",
      "tweets.html"
    );
    const htmlContent = fs.readFileSync(htmlPath, { encoding: "utf8" });

    const scriptPath = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(
          _context.extensionPath,
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

  public createWebviewPanel() {
    return vscode.window.createWebviewPanel(
      this.viewType,
      "Scheduled Tweets",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );
  }

  // public resolveWebviewView(
  //   webviewView: vscode.WebviewView,
  //   context: vscode.WebviewViewResolveContext,
  //   _token: vscode.CancellationToken
  // ) {
  //   console.log("resolveWebviewView called<><><");
  //   webviewView.webview.onDidReceiveMessage((message) => {
  //     console.log("resolving from classssss:", message);
  //     switch (message.command) {
  //       case "deleteTweet":
  //         const tweetId = message.text;
  //         console.log("did receive message:", tweetId);
  //         client.deleteTweet(tweetId);
  //         vscode.window.showInformationMessage("Tweet deleted");
  //         return;
  //       default:
  //         return;
  //     }
  //   });
  // }
}
