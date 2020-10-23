(function () {
	/**
	 * Check and set a global guard variable.
	 * If this content script is injected into the same page again,
	 * it will do nothing next time.
	 */
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	/**
	* Gets all the scripts from the page
	*/
	var list = document.getElementsByTagName("script");

	/**
	* Creates the songElements array, parses the scripts for the name and html for the song
	*/
	let songElements = [];
	for (i = 0; i < list.length; i++) {
		var src = list[i].innerHTML;
		if (src.includes("wavesurfer[eq].backend.song")) {
			let regexp = new RegExp("(?<=.backend.song = \").*(?=\";)");
			var textinner = list[i].innerHTML
			var result = textinner.match(regexp);
			var regex2 = new RegExp("(?<=\<span class='jp-title'\>).*(?=\<\/span\>)");
			var name = textinner.match(regex2);
			var obj = { "name": name[0], "src": result[0] }
			songElements.push(obj);
		}
	}

	/**
	* Handles the response from the background script
	*/
	function handleResponse(message) {
		console.log(`background script sent a response: ${message.response}`);
	}

	/**
	* Handles error
	*/
	function handleError(error) {
		console.log(`Error: ${error}`);
	}

	/**
	* Sends the message to the background script with the song elements from the array with the information
	*/
	function sendMessage(e) {
		for (i = 0; i < songElements.length; i++) {
			const sending = browser.runtime.sendMessage({ content: songElements[i] });
			sending.then(handleResponse, handleError);
		}
	}


	/**
	* This adds the listener of message events from the background script
	*/
	browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.command == "downloadFile") {
			let result = songElements.find(a => a.name == request.name);
			console.table(result);
			window.location.href = (result.src);
		}
		if (request.command == undefined) {
			setTimeout(() => {
				sendMessage("");
			}, 100);
		}
		return true;

	});

})();