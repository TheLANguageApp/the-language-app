// Function to translate
function getTranslation(word, callback) {
    var request = new XMLHttpRequest();
    request.onload = function() {
        if (request.status == 404) {
            callback(true, null);
        }
        else {
            var translation = JSON.parse(request.responseText)[0].text;
            callback(false, translation);
            //translations[word] = translation;
        }
    };
    request.open('GET', 'http://deu.hablaa.com/hs/translation/' + word + '/eng-deu/', true);
    request.send();
}

// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  var title = "Translate with LANguage";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
  var sText = info.selectionText; // TEXT TO DO ACTION TO
  getTranslation(sText, function(error, translation){
    if (!error) {
        window.alert(sText + " -> " + translation);
    }
  });

  //var url = "https://www.google.com/search?q=" + encodeURIComponent(sText);
  //window.open(url, '_blank');
};
