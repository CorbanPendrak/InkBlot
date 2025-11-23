// InkChat code
const titleText = "InkChat";
const inkBlotImage = "media/inkblot-5.png";
import { storyContent } from "inkblot-index.js";
import "ink.js";

var story = new inkjs.Story(storyContent);
let globalTagTheme;

function updateMessages(newMessages, messagesElement) {
    for (var i = 0; i < newMessages.length; i++) {
        console.log(((newMessages[i].isButton) ? "- " : "") + newMessages[i].text);
        if ((i == 0 && !newMessages[i].isButton) || i > 0 && !newMessages[i].isButton && newMessages[i-1].isButton) {
            const avatar = document.createElement("img");
            avatar.style = `border-radius: 100%;
                width: 50px;
                aspect-ratio: 1;
                height: 50px;
                border: 2px solid #000;
                box-shadow: 4px 4px 0 #000;
                margin-bottom: 6px;`; 
            avatar.src = inkBlotImage; //"media/inkblot-" + (Math.floor(Math.random() * 6) + 1) + ".png";
            messagesElement.appendChild(avatar);
        }
        messagesElement.appendChild(newMessages[i].element);
    }
    messagesElement.scrollTop = messagesElement.scrollHeight;
};

// Detects whether the user accepts animations
function isAnimationEnabled() {
    return window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
}

// Fades in an element after a specified delay
function showAfter(delay, el) {
    if (isAnimationEnabled()) {
        el.classList.add("hide");
        setTimeout(function() { el.classList.remove("hide") }, delay);
    } else {
        // If the user doesn't want animations, show immediately
        el.classList.remove("hide");
    }
}

// Scrolls the page down, but no further than the bottom edge of what you could
// see previously, so it doesn't go too far.
function scrollDown(previousBottomEdge) {
    // If the user doesn't want animations, let them scroll manually
    if ( !isAnimationEnabled() ) {
        return;
    }

    // Line up top of screen with the bottom of where the previous content ended
    var target = previousBottomEdge;

    // Can't go further than the very bottom of the page
    var limit = outerScrollContainer.scrollHeight - outerScrollContainer.clientHeight;
    if( target > limit ) target = limit;

    var start = outerScrollContainer.scrollTop;

    var dist = target - start;
    var duration = 300 + 300*dist/100;
    var startTime = null;
    function step(time) {
        if( startTime == null ) startTime = time;
        var t = (time-startTime) / duration;
        var lerp = 3*t*t - 2*t*t*t; // ease in/out
        outerScrollContainer.scrollTo(0, (1.0-lerp)*start + lerp*target);
        if( t < 1 ) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// The Y coordinate of the bottom end of all the story content, used
// for growing the container, and deciding how far to scroll.
function contentBottomEdgeY() {
    var bottomElement = storyContainer.lastElementChild;
    return bottomElement ? bottomElement.offsetTop + bottomElement.offsetHeight : 0;
}

// Remove all elements that match the given selector. Used for removing choices after
// you've picked one, as well as for the CLEAR and RESTART tags.
function removeAll(selector)
{
    var allElements = storyContainer.querySelectorAll(selector);
    for(var i=0; i<allElements.length; i++) {
        var el = allElements[i];
        el.parentNode.removeChild(el);
    }
}

// Used for hiding and showing the header when you CLEAR or RESTART the story respectively.
function setVisible(selector, visible)
{
    var allElements = storyContainer.querySelectorAll(selector);
    for(var i=0; i<allElements.length; i++) {
        var el = allElements[i];
        if( !visible )
            el.classList.add("invisible");
        else
            el.classList.remove("invisible");
    }
}

// Helper for parsing out tags of the form:
//  # PROPERTY: value
// e.g. IMAGE: source path
function splitPropertyTag(tag) {
    var propertySplitIdx = tag.indexOf(":");
    if( propertySplitIdx != null ) {
        var property = tag.substr(0, propertySplitIdx).trim();
        var val = tag.substr(propertySplitIdx+1).trim();
        return {
            property: property,
            val: val
        };
    }

    return null;
}

function createInkBlot(text, messages=[]) {
    const element = document.createElement("div");
    element.textContent = text;
    element.classList.add("box");

    var isButton = false;
    if (messages.length) {
        isButton = true;
        element.classList.add("button");
        element.style = `width: fit-content;
            max-width: 95%;
            padding: 1em;
            margin-bottom: 0.5em;
            align-self: flex-end;`;
        function callBack() {
            if (isButton) {
                // Remove other user options
                var sibling = element.nextSibling;
                while (sibling) {
                    if (!sibling.classList.contains("button")) {
                        break;
                    }
                    element.parentElement.removeChild(sibling);
                    sibling = sibling.nextSibling;
                }

                var sibling = element.previousSibling;
                while (sibling) {
                    if (!sibling.classList.contains("button")) {
                        break;
                    }
                    element.parentElement.removeChild(sibling);
                    sibling = element.previousSibling;
                }

                updateMessages(messages, element.parentElement);
                element.classList.remove("button");
                this.removeEventListener("click", callBack);
            }
        }
        element.addEventListener("click", callBack);
    } else {
        element.style = `width: fit-content;
            max-width: 95%;
            padding: 1em;
            margin-bottom: 0.5em;`;
    }

    return {text, element, isButton};
}

// Create paper
function createPaper() {
    const body = document.querySelector("body");
    const paper = document.createElement("div");
    paper.classList.add("box");
    paper.style = `width: min(500px, 90vw);
        height: min(500px, 90vh);
        position: fixed;
        bottom: calc(1rem + 16px);
        right: 16px;
        z-index: 1000;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        margin-bottom: 0;`;
    body.appendChild(paper);

    // Title
    const titleBar = document.createElement("div");
    titleBar.style = `display: flex;
        justify-content: space-between;
        padding: 0 0.5em;`;

    const title = document.createElement("div");
    title.textContent = titleText;
    title.style = `text-align: center;
        font-weight: 700;
        font-size: 1.5em;`;
    titleBar.appendChild(title);

    // Reset/Close buttons
    const chatButtons = document.createElement("div");
    chatButtons.style = `display: flex;
        gap: 10px;
        font-size: 1.5em;`;
    const refresh = document.createElement("img");
    refresh.src = "media/refresh.svg";
    refresh.style.width = "1.2em";
    refresh.addEventListener("click", () => {
        start();
    });
    chatButtons.appendChild(refresh);
    const close = document.createElement("img");
    close.src = "media/close.svg";
    close.style.width = "1.2em";
    close.addEventListener("click", () => {
        body.removeChild(paper);
        createChat();
    })
    chatButtons.appendChild(close);

    titleBar.appendChild(chatButtons);
    paper.appendChild(titleBar);

    // Separation bar
    const bar = document.createElement("hr");
    bar.style = `border-radius: 0;
        border: 2px solid #000;
        margin: 10px 0;`;
    paper.appendChild(bar);

    // Scrollbar Style
    const scrollbarStyle = document.createElement("style");
    scrollbarStyle.innerHTML = `
        ::-webkit-scrollbar {
            width: 5px; 
        }
        ::-webkit-scrollbar-track {
            background: #fff;
        }
        ::-webkit-scrollbar-thumb {
            background: #000;
            border-radius: 0;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #000;
        }
    `;
    paper.appendChild(scrollbarStyle);

    // Message area
    const messagesElement = document.createElement("div");
    messagesElement.classList.add("box");
    messagesElement.style = `overflow: auto;
        flex-grow: 1;
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
        padding-left: 0.5em;`;
    paper.appendChild(messagesElement);

    // Todo: Setup buttons?

    // Add intro message
    function start() {
        messagesElement.innerHTML = "";
        var newMessages = [];
        newMessages.push(createInkBlot("Welcome to InkBlot!"));
        newMessages.push(createInkBlot("This is a small demo of the chat application feature. Currently, it is not connected to Ink, so everything is hardcoded. That, however, will change soon!"));
        newMessages.push(createInkBlot("Wow, cool!", [
            createInkBlot("I know, right?"), 
            createInkBlot("Wait, so are you some kind of AI?", [
                createInkBlot("No, I am hardcoded into this chat interface, so I am not AI."),
                createInkBlot("Maybe someone wrote this flow with AI, but this conversation flow was designed to help answer your questions about this awesome website."),
                createInkBlot("Oh, I guess that makes since.", [
                    createInkBlot("But I haven't gotten many options...", [
                        createInkBlot("Well, this is still in development. :)")
                    ]),
                ]),
            ]),
        ]));
        newMessages.push(createInkBlot("Eh, I have seen this stuff before.", [
            createInkBlot("Sure, you have probably seen chat interfaces on many websites, \
                especially ones that can connect you with a \"helpful assistant\", but I am something different. \
                I am powered by the powerful markdown like language of Ink, allowing a more conversational narrative \
                to the website."),
            createInkBlot("Sure, whatever.", [
                createInkBlot("..."),
            ]),
            createInkBlot("I guess this is kind of interesting.", [
                createInkBlot("Exactly! This allows for developers to create a chat application with a carefully \
                    worded flow for their website!"),
            ])
        ]));

        updateMessages(newMessages, messagesElement);
    }

    continueStory(true);

    function continueStory(firstTime) {
        var paragraphIndex = 0;
        var delay = 0.0;

        while (story.canContinue) {
            var paragraphText = story.Continue();
            var tags = story.currentTags;

            // Special tags for this line
            var customClasses = [];
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];

                var splitTag = splitPropertyTag(tag);
                splitTag.property = splitTag.property.toUpperCase();

                // AUDIO: src
                if (splitTag && splitTag.property == "AUDIO") {
                    if ('audio' in this) {
                        this.audio.pause();
                        this.audio.removeAttribute('src');
                        this.audio.load();
                    }
                    this.audio = new Audio(splitTag.val);
                    this.audio.play();
                }
                
                // AUDIOLOOP: src
                else if( splitTag && splitTag.property == "AUDIOLOOP" ) {
                  if('audioLoop' in this) {
                    this.audioLoop.pause();
                    this.audioLoop.removeAttribute('src');
                    this.audioLoop.load();
                  }
                  this.audioLoop = new Audio(splitTag.val);
                  this.audioLoop.play();
                  this.audioLoop.loop = true;
                }

                // IMAGE: src
                if( splitTag && splitTag.property == "IMAGE" ) {
                    var imageElement = document.createElement('img');
                    imageElement.src = splitTag.val;
                    storyContainer.appendChild(imageElement);

                    imageElement.onload = () => {
                        console.log(`scrollingto ${previousBottomEdge}`)
                        scrollDown(previousBottomEdge)
                    }

                    showAfter(delay, imageElement);
                    delay += 200.0;
                }

                // LINK: url
                else if( splitTag && splitTag.property == "LINK" ) {
                    window.location.href = splitTag.val;
                }

                // LINKOPEN: url
                else if( splitTag && splitTag.property == "LINKOPEN" ) {
                    window.open(splitTag.val);
                }

                // BACKGROUND: src
                else if( splitTag && splitTag.property == "BACKGROUND" ) {
                    outerScrollContainer.style.backgroundImage = 'url('+splitTag.val+')';
                }

                // CLASS: className
                else if( splitTag && splitTag.property == "CLASS" ) {
                    customClasses.push(splitTag.val);
                }

                // CLEAR - removes all existing content.
                // RESTART - clears everything and restarts the story from the beginning
                else if( tag == "CLEAR" || tag == "RESTART" ) {
                    removeAll("p");
                    removeAll("img");

                    // Comment out this line if you want to leave the header visible when clearing
                    setVisible(".header", false);

                    if( tag == "RESTART" ) {
                        restart();
                        return;
                    }
                }
            }

            // Check if paragraphText is empty
            if (paragraphText.trim().length == 0) {
                continue;
            }

            // Create paragraph element
            var paragraphElement = document.createElement('p');
            paragraphElement.innerHTML = paragraphText;
            messagesElement.appendChild(paragraphElement);

            for (var i = 0; i < customClasses.length; i++) {
                paragraphElement.classList.add(customClasses[i]);
            }

            // Todo: fade in timer
            showAfter(delay, paragraphElement);
            delay += 200.0;
        }

        // Create choices
        story.currentChoices.forEach(function(choice) {
            var choiceTags = choice.tags;
            var customClasses = [];
            var isClickable = true;
            for (var i = 0; i < choiceTags.length; i++) {
                var choiceTag = choiceTags[i];
                var splitTag = splitPropertyTag(choiceTag);
                splitTag.property = splitTag.property.toUpperCase();

                if (choiceTag.toUpperCase() == "UNCLICKABLE") {
                    isClickable = false;
                }

                if (splitTag && splitTag.property == "CLASS") {
                    customClasses.push(splitTag.val);
                }
            }

            var choiceParagraphElement = document.createElement('p');
            choiceParagraphElement.classList.add('choice');
            
            for (var i = 0; i < customClasses.length; i++) {
                choiceParagraphElement.classList.add(customClasses[i]);
            }

            if (isClickable) {
                choiceParagraphElement.innerHTML = `<a href='#'>${choice.text}</a>`;
            } else {
                choiceParagraphElement.innerHTML = `<span class='unclickable'>${choice.text}</span>`;
            }
            messagesElement.appendChild(choiceParagraphElement);

            // Todo: fade in choices
            showAfter(delay, choiceParagraphElement);
            delay += 200.0;

            if (isClickable) {
                var choiceAnchorEl = choiceParagraphElement.querySelectorAll("a")[0];
                choiceAnchorEl.addEventListener("click", function(event) {
                    // Don't follow <a> link
                    event.preventDefault();

                    // Extend height to fit
                    // We do this manually so that removing elements and creating new ones doesn't
                    // cause the height (and therefore scroll) to jump backwards temporarily.
                    storyContainer.style.height = contentBottomEdgeY()+"px";

                    // Remove all existing choices
                    removeAll(".choice");

                    // Tell the story where to go next
                    story.ChooseChoiceIndex(choice.index);

                    // And loop
                    continueStory();
                });
            }
        });

        // Unset storyContainer's height, allowing it to resize itself
		storyContainer.style.height = "";

        if( !firstTime )
            scrollDown(previousBottomEdge);
    }
}

function createChat() {
    const body = document.querySelector("body");
    const chat = document.createElement("img");
    chat.src = inkBlotImage;
    chat.classList.add("button");
    chat.style = `border-radius: 100;
        position: fixed;
        bottom: calc(16px + 1.5rem);
        right: calc(16px + 0.5rem);
        width: 75px;
        padding: 0;
        z-index: 1000;
        border-radius: 100%;
        aspect-ratio: 1;`;
    body.appendChild(chat);

    chat.addEventListener("click", () => {
        body.removeChild(chat);
        createPaper();
    });
}


createChat();