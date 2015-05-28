// fetch translations when button is clicked
document.getElementById('get-translations').onclick = function() {
    getTranslation('apple', function(word) {
        document.getElementById('apple').innerHTML = "Apple => " + word;
    });
    getTranslation('lunch', function(word) {
        document.getElementById('lunch').innerHTML = "Lunch => " + word;
    });
    getTranslation('automaton', function(word) {
        document.getElementById('automaton').innerHTML = "Automaton => " + word;
    });
};

// Get translation from the translation server, and call the callback with the translated word as the parameter.
function getTranslation(word, callback) {
    var request = new XMLHttpRequest();
    request.onload = function() {
        callback(JSON.parse(request.responseText)[0].text);
    };
    request.open('GET', 'http://deu.hablaa.com/hs/translation/' + word + '/eng-deu/', true);
    request.send();
}

// update click counter when extension loads
updateClicks(JSON.parse(localStorage.getItem('clicks')) || 0); // local storage stores values as strings, so we need to convert to and from string before using them

document.getElementById('click').onclick = function() {
    // update number of clicks in local storage
    var numClicks = JSON.parse(localStorage.getItem('clicks'));
    numClicks++;
    localStorage.setItem('clicks', JSON.stringify(numClicks));

    // update click counter
    updateClicks(numClicks);
};

function updateClicks(numClicks) {
    document.getElementById('number').innerHTML = 'Number of times clicked: ' + numClicks;
}
