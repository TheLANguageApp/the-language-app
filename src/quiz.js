// Global Variables
var mouseDown = false; // if mouse is currently clicked
var mouseX = 0; // x value of mouse position when mouse is clicked (for dragging)
var mouseY = 0; // y value of mouse position (same as above)
var translations = {}; // cache all translations on this page
var remainingQuizzes; // number of remaining quizzes on page

// Get translation from the translation server, and call the callback with error if there was any and the translated word as the parameter.
// Called by getAnswersFromPage, *subFunct translateOneQuiz,
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
    translations[word] = word;
    callback(false, word);
}

// Called by startQuiz
function getAnswersFromPage(numAnswers, callback) {
    var words = document.body.textContent.split(' ');

    var selectedWords = [];
    var attempts = 0;
    // fills selected answers with 15 words
    while (selectedWords.length < 15 && attempts < 1000) {
        attempts++;
        var newWord = words[Math.floor(Math.random() * words.length)];
        // 1st condition (RegExpression), 2nd ensure not simple word, 3rd ???
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
    // variable that represents text in the document
    var translationCandidates = (
        function searchForTextNodes(root) {
            results = []; // temp array to fill translationCandidates
            for (var node = root.firstChild; node != undefined; node = node.nextSibling) {
                if (node.nodeType == 3) { // text node
                    results.push(node); // adds the text node
                }
                else {
                    results = results.concat(searchForTextNodes(node)); // iterating recurse
                }
            }
            return results; // read through all of doc returns text from doc
        }
    )(document.body);

    var finishedWords = [];
    var attempts = 0;
    function translateOneQuiz() {
        if (finishedWords.length == numQuizzes || attempts > 1000) {
            remainingQuizzes = numQuizzes;
            chrome.runtime.sendMessage({ type: 'setBadgeText', text: numQuizzes + '' });
        }
        else {
            // randomly picked text node (body)
            var candidate = translationCandidates[Math.floor(Math.random() * translationCandidates.length)];
            // collection of individual words
            var words = candidate.nodeValue.split(' ');
            // randomly picked word
            var word = words[Math.floor(Math.random() * words.length)];

            // 1st condition (RegExpression), 2nd ensure not simple word, 3rd ???
            if (/^[a-zA-Z]+$/.test(word) && word.length > 3 && finishedWords.indexOf(word) == -1) {
                // Call fills translations[]
                getTranslation(word, function(error, translation) {
                    if (!error) {
                        // these variables allow the choosen word to be put back into the doc
                        // middle represents the word, after represents the spot right after word
                        var middle = candidate.splitText(candidate.nodeValue.indexOf(word));
                        var after = middle.splitText(word.length);

                        candidate.parentNode.removeChild(middle); // word is removed to be quizzed

                        // element is the highlighted word in doc
                        var element = document.createElement('span');
                        element.innerHTML = word; // selected quiz word (i.e. answer)
                        element.classList.add('quiz'); // adds properties of quiz to element
                        // onclick call initiates the whole quizing process (actual quiz is implemented elsewhere)
                        element.onclick = (function(word, element) {
                            return function (event) {
                                // stops a previously clickable word to not function (for now)
                                event.preventDefault();
                                // stops the webpage from communicating it being clicked
                                event.stopPropagation();
                                startQuiz(word);
                                element.classList.remove('quiz'); // quiz has ended so remove highlight
                                element.onclick = function() {}; // return element (word) to former functionality
                            };
                        })(word, element);
                        candidate.parentNode.insertBefore(element, after);

                        finishedWords.push(translation); // stack of quizzed on words
                        translations[word] = translation;
                    }
                    translateOneQuiz(); // performs a quiz-prep
                });
            }
            else {
                translateOneQuiz(); // looks for another randomly viable word
            }

            attempts++;
        }
    }
    translateOneQuiz(); // actual call to quiz-prep? (starts the recursion)
}

// practiceWord is just the highlighted word (i.e., the answer to the quiz)
function startQuiz(practiceWord) {
    var element = document.createElement('div'); // element is the quiz window
    element.classList.add('quiz-box');
    element.style.left = '30px';
    element.style.bottom = '30px';
    element.onmousedown = function(elt) {
        return function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;

            e.preventDefault();
            return false;
        };
    }(element);
    element.onmousemove = function(elt) {
        return function(e) {
            displacementX = e.clientX - mouseX;
            displacementY = e.clientY - mouseY;

            mouseX = e.clientX;
            mouseY = e.clientY;

            if (mouseDown) {
                elt.style.left = parseInt(elt.style.left) + displacementX + 'px';
                elt.style.bottom = parseInt(elt.style.bottom) - displacementY + 'px';
            }

            e.preventDefault();
            return false;
        };
    }(element)
    document.body.appendChild(element);

    element.innerHTML = 'Generating quiz...'; // prompt prior to fulfillment of start of quiz

    getAnswersFromPage(4, function(result) {
        result[practiceWord] = translations[practiceWord];
        element.innerHTML = '';

        // <br /> is equivalent to new line
        var prompt = document.createElement('p'); // prompt is a paragraph (<p> is paragraph tag)
        prompt.innerHTML = 'Was ist der richtige Deutsche übersetzung von "' + practiceWord + '"?' +
          '<br>What is the correct German translation of "' + practiceWord + '"?';
        element.appendChild(prompt);

        var feedback = document.createElement('p'); // dynamic feedback (correct/incorrect)

        var buttonContainer = document.createElement('div');
        element.appendChild(buttonContainer);
        for (var word in result) {
            var button = document.createElement('button');
            button.innerHTML = result[word];
            // correct choice for quiz
            // elt is prompt
            if (word == practiceWord) {
                button.onclick = function(elt, elt2, btn, btnContainer) {
                    return function() {
                        buttonContainer.style.display = 'none';
                        elt2.style.display = 'none';
                        elt.innerHTML = 'Congratulations, you got it right!';
                        chrome.runtime.sendMessage({ type: 'incrementProgress' });
                        remainingQuizzes--;
                        chrome.runtime.sendMessage({ type: 'setBadgeText', text: remainingQuizzes + '' });
                    }
                }(feedback, prompt, button, buttonContainer); // calls itself immediately
            }
            // incorrect choice in button
            // elt is feedback, elt2 is prompt
            else {
                button.onclick = function(elt, elt2, wrd, btn) {
                    return function() {
                        elt2.innerHTML = "Leider war das nicht rightig.<br>Sorry, that was not correct.";
                        elt.innerHTML = "Aber jetzt wissen sie, dass " + btn.innerHTML + ' ' + wrd + ' bedeutet!' +
                          '<br>But now you know that ' + btn.innerHTML + ' means ' + wrd + "! Try again!";
                        btn.disabled = true;
                    }
                }(feedback, prompt, word, button); // calls itself immediately
            }
            buttonContainer.appendChild(button); // statement that adds all words to quiz (in/correct)
        }
        for (var i = 0; i <= buttonContainer.children.length; i++) { // randomize the choices
            buttonContainer.appendChild(buttonContainer.children[Math.random() * i | 0]);
        }
        buttonContainer.style.marginTop = '10px';
        buttonContainer.style.marginBottom = '10px';

        element.appendChild(feedback); // adds the feedback prompt space to the quiz window

        var close = document.createElement('button'); // create 'Close quiz' button
        close.innerHTML = 'Close quiz';
        close.className = 'close';
        // onclick it close the quizWindow
        close.onclick = function() {
            document.body.removeChild(element);
        };

        element.appendChild(close); // adds 'Close quiz' button to the quiz window
    });
}

document.body.onmousedown = function() {
    mouseDown = true;
};
document.body.onmouseup = function() {
    mouseDown = false;
};

highlightQuizCandidates(5); // creates at most 5 quizzes
