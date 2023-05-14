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
}

export const client = DatabaseClient.instance(dbconfig);
