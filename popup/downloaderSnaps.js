
let songElements = [];

/**
* Gets the popup element to add the contents dynamically
*/
var popup = document.getElementById("downloader-popup-content");

/**
* Just log the error to the console.
*/
function reportError(error) {
  console.error(`Could not work: ${error}`);
}


/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
  var newelement = document.createElement('div');
  newelement.className = "button dowbload-button";
  newelement.textContent = "NOT IN SOUNDSNAP PAGE";
  popup.appendChild(newelement);
}

 /**
* This adds and event listener for click in the download button from the popup to send a message to the content script to download the clicked sound
*/
document.addEventListener("click", (e) => {
  /**
  * Send the message to content script to start the download of the appropriate sound
  */
  function sendRequestDownload(tabs) {
    for (let tab of tabs) {
      browser.tabs.sendMessage(
        tab.id,
        { command: "downloadFile", name: e.target.textContent }
      ).then(response => {
        console.log("Response from the content script:");
      }).catch(onError);
    }
  }

  /**
  * Listen for the click on the download button to call sendRequestDownload function
  */
  if (e.target.classList.contains("dowbload-button")) {
    browser.tabs.query({ active: true, currentWindow: true })
      .then(sendRequestDownload)
      .catch(reportError);
  }
});


/**
* Gets the active tab
*/
function getActiveTab() {
  return browser.tabs.query({ active: true, currentWindow: true });
}


/**
* Error handling function
*/
function onError(error) {
  console.error(`Error: ${error}`);
}

/** 
 * NEED TO DO A ROUND TRIP TO GET INFORMATION FROM CONTENT AND POPULATE THE MENU
 *Sends the message to content when the popup opens, to ask for the list of the sounds from the page
*/
function sendMessageToTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs.sendMessage(
      tab.id,
      { greeting: "Message content to send back the music list" }
    ).then(response => {
      console.log("Message from the content script:");
    }).catch(onError);
  }
}
browser.tabs.query({
  currentWindow: true,
  active: true
}).then(sendMessageToTabs).catch(onError);


/**
 Creates the menu dynamically
*/
function handleMessage(request, sender, sendResponse) {
  var newelement = document.createElement('div');
  newelement.className = "button dowbload-button";
  newelement.textContent = request.content.name;
  newelement.setAttribute("id", request.content.name);
  popup.appendChild(newelement);
  sendResponse({ response: "response from background script" });
}
browser.runtime.onMessage.addListener(handleMessage);

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({ file: "/content_scripts/content.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);