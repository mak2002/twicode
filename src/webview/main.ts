import {
  provideVSCodeDesignSystem,
  Button,
  Tag,
  TextArea,
  TextField,
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
  saveButton.addEventListener("click", () => saveNote());
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

function saveNote() {
  console.log('saveNote called');
  const tweetText = document.getElementById("content") as TextArea;

  const tweetTextValue = tweetText?.value;

  console.log('changed values::::: ', tweetTextValue);

  const newTweet = {
    id: openedNote.id,
  }


//   vscode.postMessage({ command: "updateNote", note: noteToUpdate });
}

function acquireVsCodeApi() {
  // @ts-ignore
  return acquireVsCodeApi();
}
