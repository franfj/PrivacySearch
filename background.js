// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
	function(text, suggest) {
	  
	  var lvl = "L1";
      getSavedItem('level', (savedLevel) => {
      	if (savedLevel) {
          lvl = savedLevel;
        }
		
		var output1 = categorizeQuery(text, lvl);
		var output2 = categorizeQuery(output1, lvl);
		
    	suggest([
    		{content: text + " ", description: output1},
	 		{content: output1, description: output2}
		]);
		
	});
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {	  
	  	  
	  var lvl = "L1";
	  var searchEngine = "Google";
	  
      getSavedItem('engine', (savedEngine) => {
        if (savedEngine) {
          searchEngine = savedEngine;
        }
	  });
			  
      getSavedItem('level', (savedLevel) => {
        if (savedLevel) {
          lvl = savedLevel;
        }
		
		var categoryToSearch = categorizeQuery(text, lvl);
		
        // Encode user input for special characters , / ? : @ & = + $ #
		if (searchEngine === "Google") {
          var newURL = 'https://www.google.com/search?q=' + encodeURIComponent(categoryToSearch);
			
	    } else if (searchEngine === "Yahoo") {
          var newURL = 'https://search.yahoo.com/search?p=' + encodeURIComponent(categoryToSearch);
			
	    } else if (searchEngine === "Bing") {
          var newURL = 'https://www.bing.com/search?q=' + encodeURIComponent(categoryToSearch);
	    } 
	   
        chrome.tabs.create({ url: newURL });
	  });
	 
  });
  
function categorizeQuery(query, level) {
	
	var privacyLevel = 1;
	
	if (level === "L2") {
		privacyLevel = 2;
	} else if (level === "L3") {
		privacyLevel = 3;
	}
	
    var queryArray = preProcessQuery(query);
    var output = wsd(queryArray, privacyLevel).trim();
	
	return output;
}

function getSavedItem(key, callback) {
  chrome.storage.sync.get(key, (items) => {
    callback(chrome.runtime.lastError ? null : items[key]);
  });
}
