// Get translation from the translation server, and call the callback with error if there was any and the translated word as the parameter.
function getTranslation(word, callback) {
    // var request = new XMLHttpRequest();
    // request.onload = function() {
    //     if (request.responseText.length == 0) {
    //         callback(true, null);
    //     }
    //     else {
    //         var word = JSON.parse(request.responseText[0].text);
    //         callback(false, word);
    //     }
    // };
    // request.open('GET', 'http://deu.hablaa.com/hs/translation/' + word + '/eng-deu/', true);
    // request.send();
    if (Math.random() < 0.5) {
        callback(true, null);
    }
    else {
        callback(false, 'translation');
    }
}

var words = document.body.innerHTML.split(' ');

var translations = {};
var numWords = 0;
(
    function getNextWord() {
        if (numWords == 25) {
            document.body.innerHTML = words.join(' ');
        }
        else {
            var index = Math.floor(Math.random() * words.length);

            if (/^[a-zA-Z]+$/.test(words[index])) {
                getTranslation(words[index], function(error, translation) {
                    if (!error) {
                        console.log(translation);
                        translations[words[index]] = translation;
                        words[index] = '<span class="quiz">' + words[index] + '</span>';
                        numWords++;
                    }
                });
            }

            getNextWord();
        }
    }
)();
