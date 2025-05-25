// -- GLOBAL --
const MAX_CHARS = 150;
const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api';

const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formEl = document.querySelector('.form');
const feedbackListEl = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const hashtagEl = document.querySelector('.hashtags');

const renderFeedbackItem = (feedbackItem) => {
    // new feedback item HTML
    const feedbackItemHTML = ` 
    <li class="feedback">
        <button class="upvote">
            <i class="fa-solid fa-caret-up upvote__icon"></i>
            <span class="upvote__count">${feedbackItem.upvoteCount}</span>
        </button>
            <section class="feedback__badge">
            <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
            </section>
        <div class="feedback__content">
            <p class="feedback__company">${feedbackItem.company}</p>
         <p class="feedback__text">${feedbackItem.text}</p>
        </div>
            <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
    </li>
    `;

    // insert new feedback item in list
    feedbackListEl.insertAdjacentHTML('beforeend', feedbackItemHTML);
};


// -- COUNTER COMPONENT
(() => {
    function inputHandler() {
      // determine maximum number of characters
      const maxNrChars = MAX_CHARS; 
    
      // determine number of characters that the user has currently typed
      const nrCharsTyped = textareaEl.value.length;
    
      // calculate number of characters left (maximum - currently typed)
      const charsLeft = maxNrChars - nrCharsTyped;
    
      // show number of characters left
      counterEl.textContent = charsLeft;
    };
    
    textareaEl.addEventListener('input', inputHandler);
})();



// -- FORM COMPONENT --
(() => {
    const showVisualIndicator = textCheck => {
        const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid';
    
        // show valid indicator
        formEl.classList.add(className);
    
        // remove visual indicator
        setTimeout(() => {
            formEl.classList.remove(className);
        }, 2000);
    }
    
    
    
    const submitHandler = (event) => {
        // prevent default browser action (submitting form data to "action"-address and loaing new page)
        event.preventDefault();
    
        // get text from the textarea
        const text = textareaEl.value;
    
        // validate text (e.g. check if #hashtag is present and text is long enough)
        if (text.includes('#') && text.length >= 5) {
            showVisualIndicator('valid');
        } else {
            showVisualIndicator('invalid');
    
            // focus textarea
            textareaEl.focus();
    
            //stop this function executio
            return;
        }
    
        // we have text, now we have to extract other info from text
        const hashtag = (text.split(' ').find(word => word.includes('#')));
        const company = hashtag.substring(1);
        const badgeLetter = company.substring(0, 1).toUpperCase();
        const upvoteCount = 0;
        const daysAgo = 0;
    
        // render feedback item in list
        const feedbackItem = {
            upvoteCount: upvoteCount,
            company: company,
            badgeLetter: badgeLetter,
            daysAgo: daysAgo,
            text: text
        }
        renderFeedbackItem(feedbackItem);
    
        // send feedback item to server
        fetch(`${BASE_API_URL}/feedbacks` , {
            method: 'POST', 
            body: JSON.stringify(feedbackItem),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                console.log('An error has occurred.');
                return;
            }
            
    
            console.log('Succesfully submitted');
        }).catch(error => console.log(error));
    
        // clear textarea
        textareaEl.value = '';
    
        // blur submit button
        submitBtnEl.blur();
    
        // reset counter
        counterEl.textContent = MAX_CHARS;
    };
    
    formEl.addEventListener('submit', submitHandler);
})();




// -- FEEDBACK LIST COMPONENT --
(() => {
    const clickHandler = event => {
        // get clicked HTML ELEMENT
        const clickedEl = event.target;
    
        // determine if user intend to upvote or expand
        const upovoteIntention = clickedEl.className.includes('upvote');
    
        // run the appropriate logic
        if (upovoteIntention) {
            // get the closest upvote button
            const upvoteBtnEl = clickedEl.closest('.upvote');
    
            // disable upvote button (preventing double-click, spam)
            upvoteBtnEl.disabled = true;
    
            // select the upvote count element within the upvote button
            const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');
    
            // get currently displayed upvote count
            let upvoteCount = +upvoteCountEl.textContent;
    
            // set upvote count
            upvoteCountEl.textContent = ++upvoteCount;
    
        } else {
            // expand the clicked feedback item
            clickedEl.closest('.feedback').classList.toggle('feedback--expand');
        }
    };
    
    
    feedbackListEl.addEventListener('click', clickHandler);
    
    fetch(`${BASE_API_URL}/feedbacks`)
        .then(response => response.json())
        .then(data => {
            // remove spinner
            spinnerEl.remove();
    
            // iterate over each element in feedbacks array and then render in list
            data.feedbacks.forEach(feedbackItem => renderFeedbackItem(feedbackItem));
        })
        .catch(error => {
            feedbackListEl.textContent = 'Failed to fetch feedback Items. Error message: ${error.message}';
        });
})();






// -- HASHTAG LIST COMPONENT --
(() => {
    const clickHandler = event => {
        // get the clicked element
        const clickedEl = event.target;
    
        // stop function if click happened in list, but outside buttons
        if (clickedEl.className === 'hashtags') return;
    
        // extract company name
        const companyNameFromHashtag = clickedEl.textContent.substring(1).toLowerCase().trim();
    
        // iterate over each feedback item in the list
        feedbackListEl.childNodes.forEach(childNode => {
            // stop this iteration if it's a text node
            if (childNode.nodeType === 3) return;
    
            // extract company name
            const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();
    
            // remove feedback item from list if company name are not equal
            if (companyNameFromHashtag !== companyNameFromFeedbackItem) {
                childNode.remove();
            }
        });
    };
    
    hashtagEl.addEventListener('click', clickHandler);
})();



