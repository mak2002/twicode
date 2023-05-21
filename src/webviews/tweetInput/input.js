function showMessage(message) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.text = message;
  statusBarItem.show();

  setTimeout(() => {
    statusBarItem.hide();
    statusBarItem.dispose();
  }, 3000);
}

function getTweet() {
  var tweet = document.getElementById("tweet").value;
  var scheduled_time = document.getElementById("scheduled_time").value;

  const sqlQuery = {
    query: `
      INSERT INTO scheduled_tweets (tweet_text, scheduled_time)
      VALUES ($1, $2)
    `,
    values: [tweet, scheduled_time],
  };

  fetch("http://localhost:3000/api/tweets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tweet, scheduled_time }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Query executed successfully");
        console.log("Result:", data.result);
        window.prompt("Tweet scheduled successfully!")
      } else {
        console.error("Error executing query:", data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
