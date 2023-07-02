import {
  provideVSCodeDesignSystem,
  Button,
  TextArea,
  vsCodeButton,
  vsCodeTag,
  vsCodeTextArea,
  vsCodeTextField,
} from "@vscode/webview-ui-toolkit";
// import { window } from "vscode";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTag(),
  vsCodeTextArea(),
  vsCodeTextField()
);

// Get access to the VS Code API from within the webview context
// @ts-ignore
const webvscode = acquireVsCodeApi();
// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

function main() {
  setVSCodeMessageListener();
  // vscode.postMessage({ command: "requestNoteData" });

  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)
  const saveButton = document.getElementById("submit-button") as Button;
  saveButton.addEventListener("click", () => updateTweet());
}

// Stores the currently opened note info so we know the ID when we update it on save
let openedNote: { tags: any; id: any };

function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {
    const command = event.data.command;
    const noteData = JSON.parse(event.data.payload);

    switch (command) {
      case "receiveDataInWebview":
        openedNote = noteData;
        console.log('openedNote>>', openedNote);
        break;
    }
  });
}

function updateTweet() {
  const tweetText = document.getElementById("content") as TextArea;
  const tweetScheduledDate = document.getElementById("scheduled_date") as HTMLInputElement;

  const newTweet = {
    id: openedNote.id,
    tweet_text: tweetText.value,
    scheduled_date: tweetScheduledDate.value,
  };

  console.log('newTweet>>', newTweet);
  
  // Send the updated tweet data back to the extension
  // webvscode.postMessage({ command: "updateNote", note: newTweet });
}

