document.getElementById('number').innerHTML = localStorage.quizzesSolved;

var totalTime = localStorage.totalTime;
var hours = Math.floor(totalTime / 3600);
var minutes = Math.floor((totalTime - (hours * 3600)) / 60);
var seconds = totalTime % 60;

var accuracy = Math.ceil(localStorage.quizzesSolved * 100 / localStorage.totalAttempts);
if (isNaN(accuracy)) {
    document.getElementById('accuracy').innerHTML = 'N/A';
}
else {
    document.getElementById('accuracy').innerHTML = accuracy + '%';
}

document.getElementById('time').innerHTML = hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds.';

var wordAmounts = JSON.parse(localStorage.wordAmounts);

var wordAmountsArray = [];
for (var word in wordAmounts) {
    wordAmountsArray.push([word, wordAmounts[word]]);
}
wordAmountsArray.sort(function(a, b) {
    return a[1] - b[1];
});

for (var i = wordAmountsArray.length - 1; i >= 0 && i >= wordAmountsArray.length - 5; i--) {
    var li = document.createElement('li');
    li.innerHTML = wordAmountsArray[i][0] + ' (' + wordAmountsArray[i][1] + ' successes)';
    document.getElementById('favorites').appendChild(li);
}

document.getElementById('reset').onclick = function() {
    chrome.runtime.sendMessage({
        type: 'resetProgress'
    }, function(response) {
        location.reload();
    });
};
