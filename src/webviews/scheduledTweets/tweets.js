fetch("http://localhost:3000/api/scheduled_tweets")
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      const tweets = data.result;
      const tweetsContainer = document.getElementById("tweetsContainer");
      tweets.forEach((tweet) => {
        const tweetItem = document.createElement("li");
        tweetItem.classList.add("tweet-item");
        const count = 25;

        const tweetText = document.createElement("p");
        tweetText.classList.add("tweet-text");
        tweetText.textContent =
          tweet.tweet_text.slice(0, count) +
          (tweet.tweet_text.length > count ? "..." : "");
        tweetItem.appendChild(tweetText);

        const tweetDate = document.createElement("span");
        tweetDate.classList.add("tweet-date");
        const date = new Date(tweet.scheduled_time).toLocaleString();
        tweetDate.textContent = date;
        tweetItem.appendChild(tweetDate);

        const tweetButtons = document.createElement("div");
        tweetButtons.classList.add("tweet-buttons");

        const editButton = document.createElement("button");
        editButton.classList.add("edit-button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          console.log("TBD");
          consoleX();
        });
        tweetButtons.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.style.backgroundColor = "#f44336"
        deleteButton.addEventListener("click", async () => {
          await vscode.postMessage({
            command: "deleteTweet",
            text: tweet.id,
          });
        });
        tweetButtons.appendChild(deleteButton);

        tweetItem.appendChild(tweetButtons);

        tweetsContainer.appendChild(tweetItem);
      });
    } else {
      console.error("Error fetching scheduled tweets:", data.error);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
