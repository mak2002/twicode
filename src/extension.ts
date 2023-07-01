import * as vscode from "vscode";
import { client } from "./server/DbClient";
import { startExpressServer } from "./server/server";
import { ScheduledTweetsPanel } from "./ScheduledTweets";
import { TweetsDataProvider } from "./providers/TweetsProviders";
import { getWebviewContent } from "./ui/getWebView";
import { TweetType } from "./types/Tweet";
import { v4 as uuidv4 } from "uuid";

export async function activate(context: vscode.ExtensionContext) {
  await startExpressServer();
  client.connect();
  client.createTweetsTable();
  let panel: vscode.WebviewPanel | undefined = undefined;

  let scheduled_tweets = (await client.getTweets()).rows;
  console.log("scheduled_tweets", scheduled_tweets);

  // if (scheduled_tweets.length === 0) {
  //   scheduled_tweets = [
  //     {
  //       id: uuidv4(),
  //       tweet_text: "This is a demo tweet",
  //       scheduled_time: "2021-08-01 12:00:00",
  //       created_at: "2021-08-01 12:00:00",
  //     },
  //     {
  //       id: uuidv4(),
  //       tweet_text: "This is another demo tweet",
  //       scheduled_time: "2021-08-01 12:00:00",
  //       created_at: "2021-08-01 12:00:00",
  //     },
  //   ];
  // }

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
      const matchingTweet: TweetType = scheduled_tweets.find(
        (tweet: { id: string | undefined }) =>
          tweet.id === selectedTreeViewItem.id
      );
      const tweetTitle = matchingTweet.tweet_text.slice(0, 20);

      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          "tweetDetails",
          tweetTitle,
          vscode.ViewColumn.One,
          {
            enableScripts: true,

            // restrict the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, "out"),
            ],
          }
        );
      }
      panel.title = tweetTitle;
      panel.webview.html = getWebviewContent(
        panel.webview,
        context.extensionUri,
        matchingTweet
      );

      panel.webview.postMessage({
        command: "receiveDataInWebview",
        payload: JSON.stringify(matchingTweet),
      });
    }
  );

  const deleteTweetCommand = vscode.commands.registerCommand(
    "twicode.deleteTweet",
    async (tweet: TweetType) => {
      await tweetsDataProvider.deleteTweet(tweet);
      // (await client.getTweets()).rows;
      // tweetsDataProvider.data = scheduled_tweets;
      vscode.window.showInformationMessage("Tweet deleted");
    }
  );

  const scheduleTweetsCommand = vscode.commands.registerCommand(
    "twicode.scheduleTweet",
    () => {
      const prompt = vscode.window.showInputBox({
        placeHolder: "Enter your tweet",
      });

      const randomDate = new Date(
        +new Date() - Math.floor(Math.random() * 10000000000)
      ).toISOString();

      const id = uuidv4();
      prompt.then((tweet) => {
        if (tweet) {
          const newTweet: TweetType = {
            id: id,
            tweet_text: tweet,
            scheduled_time: randomDate,
            created_at: "2021-08-01 12:00:00",
          };

          tweetsDataProvider.insertTweet(tweet, randomDate);
        }
      });
    }
  );

  console.log("Twicode is now active!");

  let disposable = vscode.commands.registerCommand("twicode.helloWorld", () => {
    vscode.window.showInformationMessage("Hello twicode");
  });

  vscode.commands.registerCommand("twicode.showScheduledTweets", async () => {
    const panel = scheduledTweetsPanel.createWebviewPanel();

    panel.webview.html = scheduledTweetsPanel.getHtmlForWebview(context, panel);

    panel.webview.onDidReceiveMessage((message) => {
      console.log("Received message from webview:", message);
      switch (message.command) {
        case "deleteTweet":
          const tweetId = message.text;
          client.deleteTweet(tweetId);
          vscode.window.showInformationMessage("Tweet deleted");
          return;
        default:
          return;
      }
    });
  });

  context.subscriptions.push(openTweetCommand);
  context.subscriptions.push(scheduleTweetsCommand);
  context.subscriptions.push(deleteTweetCommand);
  context.subscriptions.push(disposable);
}

export function deactivate() {}
