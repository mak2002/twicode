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
        tweetDate.textContent = tweet.scheduled_time;
        tweetItem.appendChild(tweetDate);

        const tweetButtons = document.createElement("div");
        tweetButtons.classList.add("tweet-buttons");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          console.log("TBD");
        });
        tweetButtons.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          await fetch("http://localhost:3000/api/scheduled_tweets/" + tweet.id, {
            method: "DELETE",
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
