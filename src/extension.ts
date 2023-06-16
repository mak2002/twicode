import * as vscode from "vscode";
import { client } from "./server/DbClient";
import { startExpressServer } from "./server/server";
import { ScheduledTweetsPanel } from "./ScheduledTweets";
import { TweetsDataProvider } from "./providers/TweetsProviders";
import { getWebviewContent } from "./ui/getWebView";

export async function activate(context: vscode.ExtensionContext) {
  await startExpressServer();
  client.connect();
  client.createTweetsTable();
  let panel: vscode.WebviewPanel | undefined = undefined;

  // get tweets from database
  const scheduled_tweets = (await client.getTweets()).rows;
  console.log("Stweets>>>", scheduled_tweets);

  const scheduledTweetsPanel = new ScheduledTweetsPanel(context.extensionUri);
  const tweetsDataProvider = new TweetsDataProvider(scheduled_tweets);

  const treeView = vscode.window.createTreeView("notepad.notesList", {
    treeDataProvider: tweetsDataProvider,
    showCollapseAll: false,
  });

  const openTweetCommand = vscode.commands.registerCommand(
    "twicode.openTweet",
    () => {
      const selectedTreeViewItem = treeView.selection[0];
      console.log("Selected tree view item:", selectedTreeViewItem);
      const matchingTweet = scheduled_tweets.find(
        (tweet) => tweet.id === selectedTreeViewItem.id
      );

      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          "tweetDetails",
          matchingTweet.title,
          vscode.ViewColumn.One,
          {
            enableScripts: true,

            // And restrict the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, "out"),
            ],
          }
        );
      }
      panel.title = matchingTweet.title;
      panel.webview.html = getWebviewContent(
        panel.webview,
        context.extensionUri,
        matchingTweet
      );
    }
  );

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

  context.subscriptions.push(openTweetCommand);
  context.subscriptions.push(disposable);
}

export function deactivate() {}
