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
        callback(false, word);
    }
}

function getAnswersFromPage(numAnswers, callback) {
    var words = document.body.textContent.split(' ');

    var selectedWords = [];
    var attempts = 0;
    while (selectedWords.length < 15 && attempts < 1000) {
        attempts++;
        var newWord = words[Math.floor(Math.random() * words.length)];
        if (/^[a-zA-Z]+$/.test(newWord) && newWord.length > 3 && selectedWords.indexOf(newWord) == -1) {
            selectedWords.push(newWord);
        }
    }

    var translations = {};
    var index = 0;
    var numTranslations = 0;
    function translateNextWord() {
        if (index == selectedWords.length || numTranslations == numAnswers) {
            callback(translations);
        }
        else {
            if (/^[a-zA-Z]+$/.test(words[index])) {
                getTranslation(selectedWords[index], function(error, translation) {
                    if (!error) {
                        translations[selectedWords[index]] = translation;
                        numTranslations++;
                    }
                });
            }
            index++;
            translateNextWord();
        }
    }

    translateNextWord();
}

function highlightQuizCandidates(numQuizzes) {
    var translationCandidates = (
        function searchForTextNodes(root) {
            results = [];
            for (var node = root.firstChild; node != undefined; node = node.nextSibling) {
                if (node.nodeType == 3) { // text node
                    results.push(node);
                }
                else {
                    results = results.concat(searchForTextNodes(node));
                }
            }
            return results;
        }
    )(document.body);

    var finishedWords = [];
    var attempts = 0;
    function translateOneQuiz() {
        if (finishedWords.length == numQuizzes || attempts > 1000) {
            return;
        }
        else {
            var candidate = translationCandidates[Math.floor(Math.random() * translationCandidates.length)];
            var words = candidate.nodeValue.split(' ');
            var word = words[Math.floor(Math.random() * words.length)];

            if (/^[a-zA-Z]+$/.test(word) && word.length > 3 && finishedWords.indexOf(word) == -1) {
                getTranslation(word, function(error, translation) {
                    if (!error) {
                        var middle = candidate.splitText(candidate.nodeValue.indexOf(word));
                        var after = middle.splitText(word.length);

                        candidate.parentNode.removeChild(middle);

                        var element = document.createElement('span');
                        element.innerHTML = word;
                        element.classList.add('quiz');
                        element.onclick = (function(word, element) {
                            return function (event) {
                                event.preventDefault();
                                event.stopPropagation();
                                //startQuiz(word);
                                alert(word);
                                element.classList.remove('quiz');
                                element.onclick = function() {};
                            };
                        })(word, element);
                        candidate.parentNode.insertBefore(element, after);

                        finishedWords.push(translation);
                        console.log(translation);
                    }
                });
            }

            attempts++;
            translateOneQuiz();
        }
    }
    translateOneQuiz();
}

highlightQuizCandidates(5);

getAnswersFromPage(4, function(result) {
    console.log(result);
});

// for (var i = 0; i < NUM_ATTEMPTS; i++) {
//     var translationCandidate = translationCandidates[Math.floor(Math.random()) * translationCandidates.length];
//     getTranslation()
// }
//
// var translations = {};
// var numWords = 0;
// (
//     function getNextWord() {
//         if (numWords == 25) {
//             document.body.innerHTML = words.join(' ');
//         }
//         else {
//             var index = Math.floor(Math.random() * words.length);
//
            // if (/^[a-zA-Z]+$/.test(words[index])) {
            //     getTranslation(words[index], function(error, translation) {
            //         if (!error) {
            //             console.log(translation);
            //             translations[words[index]] = translation;
            //             words[index] = '<span class="quiz">' + words[index] + '</span>';
            //             numWords++;
            //         }
            //     });
            // }
//
//             getNextWord();
//         }
//     }
// )();
