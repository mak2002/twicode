import * as vscode from "vscode";
import { client } from "./server/DbClient";
import { startExpressServer } from "./server/server";
import { ScheduledTweetsPanel } from "./ScheduledTweets";
import { TweetsDataProvider } from "./providers/TweetsProviders";


export async function activate(context: vscode.ExtensionContext) {

  await startExpressServer();
  client.connect();
  client.createTweetsTable();

  // get tweets from database
  const Stweets = (await client.getTweets()).rows;
  console.log('Stweets>>>', Stweets)

  let tweets: any[] = [];

  const scheduledTweetsPanel = new ScheduledTweetsPanel(context.extensionUri);
  const tweetsDataProvider = new TweetsDataProvider(Stweets);

  const treeView = vscode.window.createTreeView("notepad.notesList", {
    treeDataProvider: tweetsDataProvider,
    showCollapseAll: false,
  });


  
  console.log("Twicode is now active!");

  let disposable = vscode.commands.registerCommand("twicode.helloWorld", () => {
    vscode.window.showInformationMessage("Hello twicode");
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

  context.subscriptions.push(disposable);
}

export function deactivate() {}
