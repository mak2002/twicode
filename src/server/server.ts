import express = require("express");
import { Pool } from "pg";
import { dbconfig } from "../dbcred";
import * as cors from "cors";
import { connectionString } from "../dbcred";

export async function startServer() {
  const app = express();
  const port = 3000; 

  app.use(cors());

  const pool = new Pool(dbconfig);

  app.post("/api/tweets", async (req, res) => {
    const { tweetText, scheduledTime } = req.body;
    const sql = `INSERT INTO scheduled_tweets (tweet_text, scheduled_time) VALUES ($1, $2)`;
    const values = [tweetText, scheduledTime];

    try {
      const result = await pool.query(sql, values);
      res.json(result);
    } catch (err) {
      console.error("Error executing query:", err);
      res.status(500).json(err);
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
