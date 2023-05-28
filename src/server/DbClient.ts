import { Client, ClientConfig } from "pg";
import { dbconfig } from "../dbcred";

export class DatabaseClient {
  client: Client;
  private static instance_: DatabaseClient | null = null;

  private constructor(config: ClientConfig) {
    this.client = new Client(config);
  }

  static instance(config: ClientConfig): DatabaseClient {
    if (!this.instance_) {
      this.instance_ = new DatabaseClient(config);
    }

    return this.instance_;
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Database connected");
    } catch (err) {
      console.error("Error connecting to database:", err);
    }
  }

  async disconnect() {
    try {
      await this.client.end();
      console.log("Database disconnected");
    } catch (err) {
      console.error("Error disconnecting from database:", err);
    }
  }

  async query(sql: string, values: any[]) {
    try {
      const result = await this.client.query(sql, values);
      return result;
    } catch (err) {
      console.error("Error executing query:", err);
      throw err;
    }
  }

  async createTweetsTable() {
    const sql = `CREATE TABLE IF NOT EXISTS scheduled_tweets (
      id SERIAL PRIMARY KEY,
      tweet_text TEXT NOT NULL,
      scheduled_time TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    try {
      const result = await this.query(sql, []);
      return result;
    } catch (err) {
      console.error("Error executing query:", err);
      throw err;
    }
  }

  async insertTweet(tweetText: string, scheduledTime: string) {
    const sql = `INSERT INTO scheduled_tweets (tweet_text, scheduled_time) VALUES ($1, $2)`;
    const values = [tweetText, scheduledTime];
    try {
      const result = await this.query(sql, values);
      return result;
    } catch (err) {
      console.error("Error executing query:", err);
      throw err;
    }
  }

  async updateTweet(id: number, tweetText: string, scheduledTime: string) {
    const sql = `UPDATE scheduled_tweets SET tweet_text = $1, scheduled_time = $2 WHERE id = $3`;
    const values = [tweetText, scheduledTime, id];
    try {
      const result = await this.query(sql, values);
      return result;
    } catch (err) {
      console.error("Error executing query:", err);
      throw err;
    }
  }

  async deleteTweet(id: number) {
    const sql = `DELETE FROM scheduled_tweets WHERE id = $1`;
    const values = [id];
    try {
      const result = await this.query(sql, values);
      return result;
    } catch (err) {
      console.error("Error executing query:", err);
      throw err;
    }
  }
}

export const client = DatabaseClient.instance(dbconfig);
