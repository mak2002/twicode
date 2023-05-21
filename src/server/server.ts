import express = require("express");
import { Pool } from "pg";
import { dbconfig } from "../dbcred";
import * as cors from "cors";

export async function startServer() {
  const app = express();
  const port = 3000;

  app.use(cors());
  app.use(express.json());

  const pool = new Pool(dbconfig);

  app.post("/api/tweets", async (req, res) => {
    const { tweet, scheduled_time } = req.body;
    const sql = `INSERT INTO scheduled_tweets (tweet_text, scheduled_time) VALUES ($1, $2)`;
    const values = [tweet, scheduled_time];

    try {
      const result = await pool.query(sql, values);

      const result2 = await pool.query("SELECT * FROM scheduled_tweets");
      console.log("Result of query:", result2.rows);
      console.log("Query executed successfully");
      res.json({ success: true, result: result.rows });
    } catch (err: any) {
      console.error("Error executing query:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/scheduled_tweets", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM scheduled_tweets");
      console.log("Result of query:", result.rows);
      console.log("Query executed successfully");
      res.json({ success: true, result: result.rows });
    } catch (err: any) {
      console.error("Error executing query:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
