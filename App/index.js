'use strict';

(function() {
    const GUTENDEX_URL = "https://gutendex.com";
    const MIRROR_URL = "http://mirrors.xmission.com/gutenberg";

    var bookContent = "";
    var res;

    let typingText = document.querySelector('.typing-text p');
    let inpField = document.querySelector('.wrapper .input-field');
    let backButton = document.querySelector('.content-box > button');
    let previousButton = document.querySelectorAll('.content button')[0];
    let nextButton = document.querySelectorAll('.content button')[1];
    let pageLabel = document.querySelector('.content > p');
    let timeTag = document.querySelector('.time span b');
    let mistakeTag = document.querySelector('.mistake span');
    let wpmTag = document.querySelector('.wpm span');
    let cpmTag = document.querySelector('.cpm span');
    let timer,
        maxTime = 120,
        timeLeft = maxTime,
        charIndex = 0;
    let mistakes = 0;
    let isTyping = 0;
    let pageNumber = 0;

    window.addEventListener('load', init);

    /**
     * This function is the initial function that runs when the window of the webpage
     * is first opened. It adds an event listener to the 'Search' button.
     * @return {void}
     */
    function init() {
        let searchBar = document.querySelector('#welcome input[type=text]');
        document.querySelector('#welcome button').addEventListener('click', () => {
            document.querySelector('#results').classList.add('hidden');
            document.querySelector('#description').classList.add('hidden');
            document.querySelector('#loading').classList.remove('hidden');
            getResults(searchBar.value);
            setTimeout(function() {
                document.querySelector('#loading').classList.add('hidden');
                document.querySelector('#results').classList.remove('hidden');
            }, 3000);
        });

        let confirmButton = document.querySelector('#description button');
        confirmButton.addEventListener('click', () => {
            document.querySelector('#description').classList.add('hidden');
            document.querySelector('#loading').classList.remove('hidden');
            setTimeout(function() {
                pageNumber = 0;
                loadPage();
            }, 1000);
            setTimeout(function() {
                document.querySelector('#loading').classList.add('hidden');
                document.querySelector('#game').classList.remove('hidden');
                searchBar.classList.add('hidden');
                document.querySelector('#welcome button').classList.add('hidden');
            }, 3000);
        });

        inpField = document.querySelector('.wrapper .input-field');
        inpField.addEventListener("input", initTyping);

        previousButton = document.querySelectorAll('.content button')[0];
        previousButton.addEventListener("click", previousPage);

        nextButton = document.querySelectorAll('.content button')[1];
        nextButton.addEventListener("click", nextPage);

        backButton = document.querySelector('.content-box > button');
        backButton.addEventListener("click", backToDescriptionPage);

        pageLabel = document.querySelector('.content > p');
        typingText = document.querySelector('.typing-text p');
        timeTag = document.querySelector('.time span b');
        mistakeTag = document.querySelector('.mistake span');
        wpmTag = document.querySelector('.wpm span');
        cpmTag = document.querySelector('.cpm span');


        eel.expose(returnResult);
    }

    function returnResult(result) {
        document.querySelector('#results').innerHTML = '';
        bookContent = result;

        // FILL IN DETAILS IN PAGE AFTER LOADING
        let bookWords = bookContent.split(" ");
        document.querySelector('#wordCount').textContent = 'Word Count: ' + bookWords.length;
        document.querySelector('#characterCount').textContent = 'Character Count: ' + bookContent.length;

        // SAVE BOOK's CONTENT IN pages.js
        while (pages.length > 0) {
            pages.pop();
        }
        for (let n = 0; n < bookWords.length;) {
            let page = "";
            let m = 0;
            for (; m < 200; m++) {
                if ((m + n) < bookWords.length) {
                    page += bookWords[m + n] + " ";
                } else {
                    break;
                }
            }
            n += m + 1;
            pages.push(page);
        }
    }

    /**
     * This function receieves the user's search query input to fetch the API data
     * from the GUTENDEX_URL. It checks for the status of the response that
     * the API returns, and throws an error if the response is not 'ok.' The function
     * also takes the responding API into proper json format so that it can call
     * a helper function that processes the json data. If there's an error regarding
     * the content of the json data, it will catch the error.
     * @param {string} query - input of user's search bar
     * @return {void}
     */
    function getResults(query) {
        let searchURL = GUTENDEX_URL + '/books/?search=' + query.trim().replace(/\s/g, '%20');
        console.log("Retrieving search results from " + searchURL);
        fetch(searchURL)
            .then(statusCheck)
            .then(res => res.json())
            .then(displayResults)
            .catch(errorHandler);
    }

    /**
     * This function processes the given json data to break it down into multiple
     * components and attaches buttons onto the webpage that leads to amiibos' info.
     * It takes the queried game series to produce buttons based on it. It also
     * clears any previous images from prevous queries.
     * @param {object} response - json data object containing query results
     * @return {void}
     */
    function displayResults(response) {
        res = response;
        document.querySelector('#description').classList.add('hidden');
        document.querySelector('#game').classList.add('hidden');
        document.querySelector('#results').innerHTML = '';
        for (let i = 0; i < response.results.length; i++) {
            let book = document.createElement('div');

            let titleBtn = document.createElement('button');
            titleBtn.textContent = 'Select';


            // CHANGE THE BOTTOM EVENTLISTENER SO THAT WHEN THE TITLE TEXT IS CLICKED,
            // THE PAGE WILL DISPLAY DETAILS ABOUT THE BOOK
            titleBtn.addEventListener('click', () => {
                document.querySelector('#results').innerHTML = '';
                document.querySelector('#results').classList.add('hidden');
                document.querySelector('#description').classList.remove('hidden');
                console.log('Displaying details for book number ' + i);

                let bookID = response.results[i].id;
                let bookURL = "";
                bookID = Math.floor(bookID / 10);
                while (bookID > 0) {
                    bookURL = "/" + (bookID % 10).toString() + bookURL;
                    bookID = Math.floor(bookID / 10);
                }
                bookURL = MIRROR_URL + bookURL + "/" + response.results[i].id + "/" + response.results[i].id + "-0.txt";
                console.log("Retrieving book .txt file from " + bookURL);
                eel.getBookText(bookURL);

                showDescription(i);
            });


            // CREATE A NEW IMAGE ELEMENT DISPLAYING THE BOOK'S COVER IMAGE
            let img = document.createElement('img');
            img.src = response.results[i].formats["image/jpeg"];
            img.alt = 'Cover image of ' + response.results[i].title;

            book.appendChild(img);
            book.appendChild(titleBtn);

            document.querySelector('#results').appendChild(book);
        }
    }

    function showDescription(i) {
        // CREATE A NEW IMAGE ELEMENT DISPLAYING THE BOOK'S COVER IMAGE
        let img = document.querySelector('#description > article > img');
        img.src = res.results[i].formats["image/jpeg"];
        img.alt = 'Cover image of ' + res.results[i].title;


        // FILL IN DETAILS OF THE BOOK
        document.querySelector('#title').textContent = 'Title: ' + res.results[i].title;
        document.querySelector('#author').textContent = 'Author: ' + res.results[i].authors[0].name;
        document.querySelector('#wordCount').textContent = 'Word Count: ...';
        document.querySelector('#characterCount').textContent = 'Character Count: ...';
        document.querySelector('#subjects > ul').innerHTML = '';
        let sbjts = res.results[i].subjects;
        for (let n = 0; n < sbjts.length; n++) {
            let subjectItem = document.createElement('li');
            subjectItem.textContent = sbjts[n];
            document.querySelector('#subjects > ul').appendChild(subjectItem);
        }
    }

    /**
     * This function handles the error of the json data. Most often, it will be
     * caused by an invalid input from the user (a game series that the API does
     * not carry). It also removes all previous queried results and displays an
     * appropriate error message to the user.
     * @return {void}
     */
    function errorHandler(e) {
        console.error(e);
        document.querySelector('#results').innerHTML = '';
        let failed = document.createElement('p');
        failed.textContent = '***  Sorry, but the book you\'re looking for doesn\'t exist.  ***';
        document.querySelector('#results').appendChild(failed);
    }

    /**
     * This function checks for the status of the fetched value of the API call by
     * checking if the returned value is 'ok.' It will throw an error if it isn't
     * considered 'ok.'
     * @param {object} response - json data object containing query results
     * @return {object} - returning the current json data object
     */
    async function statusCheck(response) {
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response;
    }

    // const typingText = document.querySelector(".typing-text p"),
    //     inpField = document.querySelector(".wrapper .input-field"),
    //     tryAgainBtn = document.querySelector(".content button"),
    //     timeTag = document.querySelector(".time span b"),
    //     mistakeTag = document.querySelector(".mistake span"),
    //     wpmTag = document.querySelector(".wpm span"),
    //     cpmTag = document.querySelector(".cpm span");
    // let timer,
    //     maxTime = 60,
    //     timeLeft = maxTime,
    //     charIndex = 0;
    // let mistakes = 0;
    // let isTyping = 0;

    function loadPage() {
        pageLabel.innerHTML = 'Page ' + (pageNumber + 1) + ' of ' + pages.length;
        typingText.innerHTML = '';
        pages[pageNumber].split("").forEach(char => {
            let span = `<span>${char}</span>`
            typingText.innerHTML += span;
        });
        typingText.querySelectorAll("span")[0].classList.add("active");
        document.addEventListener("keydown", () => inpField.focus());
        typingText.addEventListener("click", () => inpField.focus());
    }

    function initTyping() {
        let characters = typingText.querySelectorAll("span");
        let typedChar = inpField.value.split("")[charIndex];
        if (charIndex < characters.length - 1 && timeLeft > 0) {
            if (!isTyping) {
                timer = setInterval(initTimer, 1000);
                isTyping = true;
            }
            if (typedChar == null) {
                if (charIndex > 0) {
                    charIndex--;
                    if (characters[charIndex].classList.contains("incorrect")) {
                        mistakes--;
                    }
                    characters[charIndex].classList.remove("correct", "incorrect");
                }
            } else {
                if (characters[charIndex].innerText == typedChar) {
                    characters[charIndex].classList.add("correct");
                } else {
                    mistakes++;
                    characters[charIndex].classList.add("incorrect");
                }
                charIndex++;
            }
            characters.forEach(span => span.classList.remove("active"));
            characters[charIndex].classList.add("active");
            let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 120);
            wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

            wpmTag.innerText = wpm;
            mistakeTag.innerText = mistakes;
            cpmTag.innerText = charIndex - mistakes;
        } else {
            clearInterval(timer);
            inpField.value = "";
        }
    }

    function initTimer() {
        if (timeLeft > 0) {
            timeLeft--;
            timeTag.innerText = timeLeft;
            let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 120);
            wpmTag.innerText = wpm;
        } else {
            clearInterval(timer);
        }
    }

    function previousPage() {
        if (pageNumber > 0) {
            pageNumber--;
            loadPage();
            clearInterval(timer);
            timeLeft = maxTime;
            charIndex = mistakes = isTyping = 0;
            inpField.value = "";
            timeTag.innerText = timeLeft;
            wpmTag.innerText = 0;
            mistakeTag.innerText = 0;
            cpmTag.innerText = 0;
        }
    }

    function nextPage() {
        if (pageNumber < pages.length - 1) {
            pageNumber++;
            loadPage();
            clearInterval(timer);
            timeLeft = maxTime;
            charIndex = mistakes = isTyping = 0;
            inpField.value = "";
            timeTag.innerText = timeLeft;
            wpmTag.innerText = 0;
            mistakeTag.innerText = 0;
            cpmTag.innerText = 0;
        }
    }

    function backToDescriptionPage() {
        document.querySelector('#welcome input[type=text]').classList.remove('hidden');
        document.querySelector('#welcome button').classList.remove('hidden');
        document.querySelector('#game').classList.add('hidden');
        document.querySelector('#description').classList.remove('hidden');
        clearInterval(timer);
        timeLeft = maxTime;
        charIndex = mistakes = isTyping = 0;
        inpField.value = "";
        timeTag.innerText = timeLeft;
        wpmTag.innerText = 0;
        mistakeTag.innerText = 0;
        cpmTag.innerText = 0;
    }

    // loadPage();
    // inpField.addEventListener("input", initTyping);
    // tryAgainBtn.addEventListener("click", resetGame);
})();