function getTweet() {
  var tweet = document.getElementById("tweet").value;

  // Send tweet to background script
  chrome.runtime.sendMessage({ tweet: tweet });
  console.log(tweet);
}
