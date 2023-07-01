import {
  Event,
  EventEmitter,
  ProviderResult,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
} from "vscode";
import { TweetType } from "../types/Tweet";
import * as vscode from "vscode";
import { client as dbClient } from "../server/DbClient";
import { randomUUID } from "crypto";

type TreeDataOnChangeEvent = ScheduledTweet | undefined | null | void;

export class TweetsDataProvider implements TreeDataProvider<ScheduledTweet> {
  private _onDidChangeTreeData = new EventEmitter<TreeDataOnChangeEvent>();
  readonly onDidChangeTreeData: Event<TreeDataOnChangeEvent> =
    this._onDidChangeTreeData.event;

  data: ScheduledTweet[];

  constructor(tweetsData: TweetType[]) {
    // Group tweets by scheduled date
    this.data = [];
    this.groupTweetsByScheduledDate(tweetsData, "asc");
  }

  sortTweets(sortOrder: string, tweetsData: TweetType[]) {
    if (sortOrder === "asc") {
      tweetsData.sort(
        (
          a: { scheduled_time: string | number | Date },
          b: { scheduled_time: string | number | Date }
        ) => {
          return (
            new Date(a.scheduled_time).getTime() -
            new Date(b.scheduled_time).getTime()
          );
        }
      );
    } else {
      tweetsData.sort((a, b) => {
        return (
          new Date(b.scheduled_time).getTime() -
          new Date(a.scheduled_time).getTime()
        );
      });
    }

    return tweetsData;
  }

  groupTweetsByScheduledDate(tweetsData: TweetType[], sortOrder: string) {
    console.log("Preparing data");
    const groupedData: { [scheduledDate: string]: TweetType[] } = {};

    const sortedTweets = this.sortTweets(sortOrder, tweetsData);

    for (const tweet of sortedTweets) {
      const { scheduled_time } = tweet;

      if (scheduled_time in groupedData) {
        groupedData[scheduled_time].push(tweet);
      } else {
        groupedData[scheduled_time] = [tweet];
      }
    }

    // Create tree items for each scheduled date and its children
    this.data = Object.entries(groupedData).map(([scheduledDate, tweets]) => {
      const parentItem = new ScheduledTweet(
        scheduledDate,
        new Date(scheduledDate).toUTCString().slice(0, -12),
        "parent"
      );

      const newTime = new Date(new Date(scheduledDate).getTime() * 1000)
        .toUTCString()
        .slice(17, -3);

      parentItem.children = tweets.map(
        (tweet) =>
          new ScheduledTweet(tweet.id, newTime + "• " + tweet.tweet_text),
        "child"
      );
      return parentItem;
    });
  }

  async insertTweet(tweet_text: string, scheduled_time: string) {
    const newTweets: TweetType[] = await dbClient.insertTweet(
      randomUUID(),
      tweet_text,
      scheduled_time
    );
    // fetch all tweets from database
    let scheduled_tweets = (await dbClient.getTweets()).rows;
    console.log("Inserting Tweet", newTweets);
    this.refresh(scheduled_tweets);
  }

  async deleteTweet(tweet: TweetType) {
    try {
      // Delete tweet from database and check if it was successful
      const deletedTweet = await dbClient.deleteTweet(tweet.id);
      console.log("Deleted Tweet", deletedTweet);

      let scheduled_tweets = (await dbClient.getTweets()).rows;
      console.log("dont show deleted Tweets", scheduled_tweets);
      this.refresh(scheduled_tweets);
    } catch (error) {
      console.log(error);
    }
  }

  refresh(current_tweets: TweetType[]): void {
    this._onDidChangeTreeData.fire();
    this.groupTweetsByScheduledDate(current_tweets, "asc");
    console.log("Refreshed Data????????????", this.data);
  }

  getTreeItem(element: ScheduledTweet): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(
    element?: ScheduledTweet | undefined
  ): ProviderResult<ScheduledTweet[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children ? element.children : [];
  }
}

class ScheduledTweet extends TreeItem {
  children?: ScheduledTweet[];

  constructor(tweetId: string, tweetTitle: string, type?: string) {
    super(tweetTitle, vscode.TreeItemCollapsibleState.Collapsed);

    this.id = tweetId;

    if (type === "parent") {
      this.iconPath = new ThemeIcon("calendar");
    } else {
      this.iconPath = new ThemeIcon("twitter");
      vscode.TreeItemCollapsibleState.None;
      this.command = {
        title: "Open tweet",
        command: "twicode.openTweet",
      };
    }
  }
}
