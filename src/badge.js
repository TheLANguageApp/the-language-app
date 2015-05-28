chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'setBadgeText') {
        chrome.browserAction.setBadgeText({
            text: sender.tab.id + '',
            tabId: sender.tab.id
        });
    }
});

chrome.browserAction.setBadgeBackgroundColor({
    color: [0, 128, 196, 255]
});
