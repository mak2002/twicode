import path = require("path");
import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "twicode" is now active!');

  let disposable = vscode.commands.registerCommand("twicode.helloWorld", () => {
    vscode.window.showInformationMessage("Its working");
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

    const htmlPath = vscode.Uri.file(
      path.join(context.extensionPath, "src/webviews/tweetInput/input.html")
    );
    panel.webview.html = fs.readFileSync(htmlPath.fsPath, { encoding: "utf8" });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
