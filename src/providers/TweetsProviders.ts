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
import { client } from "../server/DbClient";

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
    console.log("newly constructed data>>>>:::", this.data);
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
        (tweet) => new ScheduledTweet(tweet.id, newTime + '| ' + tweet.tweet_text),
        "child"
      );
      return parentItem;
    });
  }

  async insertTweet(
    current_tweets: TweetType[],
    tweet_text: string,
    scheduled_time: string
  ) {
    const newTweets: TweetType[] = await client.insertTweet(
      tweet_text,
      scheduled_time
    );
    console.log("Inserting Tweet", newTweets);
    this.refresh(current_tweets, newTweets);
  }

  refresh(current_tweets: TweetType[], tweetsData: TweetType[]): void {
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
