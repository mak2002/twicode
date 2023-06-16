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

type TreeDataOnChangeEvent = ScheduledTweet | undefined | null | void;

export class TweetsDataProvider implements TreeDataProvider<ScheduledTweet> {
  private _onDidChangeTreeData = new EventEmitter<TreeDataOnChangeEvent>();
  readonly onDidChangeTreeData: Event<TreeDataOnChangeEvent> =
    this._onDidChangeTreeData.event;

  data: ScheduledTweet[];

  constructor(notesData: TweetType[]) {
    const groupedData: { [scheduledDate: string]: TweetType[] } = {};

    // Group tweets by scheduled date
    for (const note of notesData) {
      const { scheduled_time } = note;
      if (scheduled_time in groupedData) {
        groupedData[scheduled_time].push(note);
      } else {
        groupedData[scheduled_time] = [note];
      }
    }

    // Create tree items for each scheduled date and its children
    this.data = Object.entries(groupedData).map(([scheduledDate, tweets]) => {
      const parentItem = new ScheduledTweet(
        scheduledDate,
        new Date(scheduledDate).toUTCString().slice(0, -4),
        "parent"
      );
      parentItem.children = tweets.map(
        (tweet) => new ScheduledTweet(tweet.id, tweet.tweet_text),
        "child"
      );
      return parentItem;
    });

    console.log("new dataaaa:::", this.data);
  }

  refresh(notesData: TweetType[]): void {
    this._onDidChangeTreeData.fire();
    this.data = notesData.map(
      (note) => new ScheduledTweet(note.id, note.tweet_text)
    );
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
