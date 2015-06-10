if (localStorage.quizzesSolved === undefined) {
    localStorage.quizzesSolved = 0;
}

if (localStorage.totalAttempts === undefined) {
    localStorage.totalAttempts = 0;
}

if (localStorage.totalTime === undefined) {
    localStorage.totalTime = 0;
}

if (localStorage.wordAmounts === undefined) {
    localStorage.wordAmounts = {};
}

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

    if (request.type == 'incrementProgress') {
        localStorage.quizzesSolved = JSON.parse(localStorage.quizzesSolved) + 1;
        localStorage.totalTime = JSON.parse(localStorage.totalTime) + request.time;

        var wordAmounts = JSON.parse(localStorage.wordAmounts);
        if (!wordAmounts[request.word]) {
            wordAmounts[request.word] = 1;
        }
        else {
            wordAmounts[request.word]++;
        }
        localStorage.wordAmounts = JSON.stringify(wordAmounts);
    }

    if (request.type == 'recordAttempt') {
        localStorage.totalAttempts = JSON.parse(localStorage.totalAttempts) + 1;
    }

    if (request.type == 'resetProgress') {
        localStorage.quizzesSolved = 0;
        localStorage.totalAttempts = 0;
        localStorage.totalTime = 0;
        localStorage.wordAmounts = '{}';
        sendResponse();
    }
});
