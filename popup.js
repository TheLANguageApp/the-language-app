var request1 = new XMLHttpRequest();
request1.onload = function() {
    document.getElementById('apple').innerHTML = "Apple => " + JSON.parse(request1.responseText)[0].text;
};
request1.open('GET', 'http://deu.hablaa.com/hs/translation/apple/eng-deu/', true);
request1.send();

var request2 = new XMLHttpRequest();
request2.onload = function() {
    document.getElementById('lunch').innerHTML = "Lunch => " + JSON.parse(request2.responseText)[0].text;
};
request2.open('GET', 'http://deu.hablaa.com/hs/translation/lunch/eng-deu/', true);
request2.send();

var request3 = new XMLHttpRequest();
request3.onload = function() {
    document.getElementById('automaton').innerHTML = "Automaton => " + JSON.parse(request3.responseText)[0].text;
};
request3.open('GET', 'http://deu.hablaa.com/hs/translation/automaton/eng-deu/', true);
request3.send();
