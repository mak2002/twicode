import path = require("path");
import * as vscode from "vscode";
import * as fs from "fs";
import { client } from "./server/server";
require("dotenv").config();

export async function activate(context: vscode.ExtensionContext) {
  await client.query(
    `CREATE TABLE scheduled_tweets (
    id SERIAL PRIMARY KEY,
    tweet_text TEXT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
    []
  );

  await client.connect();

  let disposable = vscode.commands.registerCommand(
    "twicode.helloWorld",
    async () => {
      vscode.window.showInformationMessage("Its working!!");
    }
  );

  vscode.commands.registerCommand("twicode.scheduleTweet", async () => {
    const panel = vscode.window.createWebviewPanel(
      "myWebview",
      "Input Tweet",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    const htmlPath = vscode.Uri.file(
      path.join(context.extensionPath, "src/webviews/tweetInput/input.html")
    );
    panel.webview.html = fs.readFileSync(htmlPath.fsPath, { encoding: "utf8" });
  });

  await client.disconnect();
  context.subscriptions.push(disposable);
}

export function deactivate() {}
