fetch('http://localhost:3000/api/scheduled_tweets')
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      const tweets = data.result;
      const tweetsContainer = document.getElementById('tweetsContainer');
      tweets.forEach((tweet) => {
        const tweetElement = document.createElement('p');
        tweetElement.textContent = tweet.tweet_text;
        tweetsContainer.appendChild(tweetElement);
      });
    } else {
      console.error('Error fetching scheduled tweets:', data.error);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
