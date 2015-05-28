chrome.browserAction.setBadgeBackgroundColor({
    color: [0, 128, 196, 255]
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'setBadgeText') {
        chrome.browserAction.setBadgeText({
            text: request.text,
            tabId: sender.tab.id
        });
    }
});
