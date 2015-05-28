var translations = {}; // cache all translations on this page

// Get translation from the translation server, and call the callback with error if there was any and the translated word as the parameter.
function getTranslation(word, callback) {
    // var request = new XMLHttpRequest();
    // request.onload = function() {
    //     if (request.status == 404) {
    //         callback(true, null);
    //     }
    //     else {
    //         var translation = JSON.parse(request.responseText)[0].text;
    //         callback(false, translation);
    //         translations[word] = translation;
    //     }
    // };
    // request.open('GET', 'http://deu.hablaa.com/hs/translation/' + word + '/eng-deu/', true);
    // request.send();
    callback(false, word);
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

    var answers = {};
    var index = 0;
    var numTranslations = 0;
    function translateNextWord() {
        if (index == selectedWords.length || numTranslations == numAnswers) {
            callback(answers);
        }
        else {
            if (/^[a-zA-Z]+$/.test(words[index])) {
                getTranslation(selectedWords[index], function(error, translation) {
                    if (!error) {
                        answers[selectedWords[index]] = translation;
                        numTranslations++;
                    }
                    index++;
                    translateNextWord();
                });
            }
            else {
                index++;
                translateNextWord();
            }
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
                                startQuiz(word);
                                element.classList.remove('quiz');
                                element.onclick = function() {};
                            };
                        })(word, element);
                        candidate.parentNode.insertBefore(element, after);

                        finishedWords.push(translation);
                        translations[word] = translation;
                    }
                    translateOneQuiz();
                });
            }
            else {
                translateOneQuiz();
            }

            attempts++;
        }
    }
    translateOneQuiz();
}

function startQuiz(practiceWord) {
    console.log(practiceWord);
    var element = document.createElement('div');
    element.classList.add('quiz-box');
    document.body.appendChild(element);

    element.innerHTML = 'Generating quiz...';

    getAnswersFromPage(4, function(result) {
        result[practiceWord] = translations[practiceWord];
        element.innerHTML = '<p>What is the meaning of "' + practiceWord + '" in German?<p>';
        for (var word in result) {
            element.innerHTML += '<button onclick="alert(\'foo\')">' + result[word] + '</button>';
        }
    });
}

highlightQuizCandidates(5);
