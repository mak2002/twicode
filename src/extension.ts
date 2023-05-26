import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { client } from "./server/DbClient";
import { startServer } from "./server/server";
import { ScheduledTweetsPanel } from "./ScheduledTweets";

export async function activate(context: vscode.ExtensionContext) {
  client.connect();
  client.createTweetsTable();
  await startServer();

  console.log("Twicode is now active!");

  let disposable = vscode.commands.registerCommand("twicode.helloWorld", () => {
    vscode.window.showInformationMessage("!!");
  });

  vscode.commands.registerCommand("twicode.showScheduledTweets", async () => {
    ScheduledTweetsPanel.checkAndShow(context.extensionUri);
  });

  vscode.commands.registerCommand("twicode.scheduleTweet", async () => {
    const panel = vscode.window.createWebviewPanel(
      "myWebview",
      "Input Tweet",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    panel.webview.onDidReceiveMessage((message) => {
      if (message.type === "success") {
        vscode.window.showInformationMessage(message.message);
      }
    });

    const htmlPath = path.join(
      context.extensionPath,
      "src",
      "webviews",
      "tweetInput",
      "input.html"
    );
    const htmlContent = fs.readFileSync(htmlPath, { encoding: "utf8" });

    const scriptPath = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(
          context.extensionPath,
          "src",
          "webviews",
          "tweetInput",
          "input.js"
        )
      )
    );

    const modifiedHtmlContent = htmlContent.replace(
      "./input.js",
      scriptPath.toString()
    );

    panel.webview.html = modifiedHtmlContent;
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
