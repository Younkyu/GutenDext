'use strict';

(function() {
    const GUTENDEX_URL = "https://gutendex.com";
    const MIRROR_URL = "http://mirrors.xmission.com/gutenberg";

    var bookContent = "";

    window.addEventListener('load', init);

    /**
     * This function is the initial function that runs when the window of the webpage
     * is first opened. It adds an event listener to the 'Search' button.
     * @return {void}
     */
    function init() {
        let searchBar = document.querySelector('#welcome input[type=text]');
        document.querySelector('#welcome button').addEventListener('click', () => {
            getResults(searchBar.value);
        });

        eel.expose(returnResult);
    }

    function returnResult(result) {
        document.querySelector('#results').innerHTML = '';
        bookContent = result;
        let actualText = document.createElement('p');
        actualText.textContent = bookContent;
        document.querySelector('#results').appendChild(actualText);
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
        document.querySelector('#results').innerHTML = '';
        for (let i = 0; i < response.results.length; i++) {
            let book = document.createElement('div');

            let titleBtn = document.createElement('button');
            titleBtn.textContent = response.results[i].title;


            // CHANGE THE BOTTOM EVENTLISTENER SO THAT WHEN THE TITLE TEXT IS CLICKED,
            // THE PAGE WILL DISPLAY DETAILS ABOUT THE BOOK
            titleBtn.addEventListener('click', () => {
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

})();