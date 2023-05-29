import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { client } from "./server/DbClient";
import { startServer } from "./server/server";
import { ScheduledTweetsPanel } from "./ScheduledTweets";
import { TweetsInputForm } from "./TweetsInputForm";

export async function activate(context: vscode.ExtensionContext) {
  client.connect();
  client.createTweetsTable();
  await startServer();

  const scheduledTweetsPanel = new ScheduledTweetsPanel(context.extensionUri);
  const tweetsInputForm = new TweetsInputForm(context.extensionUri);

  console.log("Twicode is now active!");

  let disposable = vscode.commands.registerCommand("twicode.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World");
  });

  // show scheduled tweets command
  vscode.commands.registerCommand("twicode.showScheduledTweets", async () => {
    const panel = scheduledTweetsPanel.createWebviewPanel();

    panel.webview.html = scheduledTweetsPanel.getHtmlForWebview(context, panel);

    panel.webview.onDidReceiveMessage((message) => {
      console.log("Received message from webview:", message);
      switch (message.command) {
        case "deleteTweet":
          const tweetId = message.text;
          console.log("did receive message:", tweetId);
          client.deleteTweet(tweetId);
          vscode.window.showInformationMessage("Tweet deleted");
          return;
        default:
          return;
      }
    });
  });

  // schedule tweet command
  vscode.commands.registerCommand("twicode.scheduleTweet", async () => {
    const panel = tweetsInputForm.createWebviewPanel();

    panel.webview.onDidReceiveMessage((message) => {
      if (message.type === "success") {
        vscode.window.showInformationMessage(message.message);
      }
    });

    panel.webview.html = tweetsInputForm.getHtmlForWebview(context, panel);
  });

  // Register the webview view provider
  // vscode.window.registerWebviewViewProvider(scheduledTweetsPanel.viewType, scheduledTweetsPanel);

  context.subscriptions.push(disposable);
}

export function deactivate() {}
