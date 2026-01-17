// InkBlot code
const titleText = "InkBlot";
const inkFile = "index";
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const thinkingTime = 1;
const charsPerSecond = prefersReducedMotion ? 1000 : 30;
const randomizeEnd = prefersReducedMotion ? 1 : 2;
const randomizeEndSize = prefersReducedMotion ? 1 : 2;

import inkBlotImage from "./media/inkblot-4.png";
import closeImage from "./media/close.svg";
import refreshImage from "./media/refresh.svg";
import "./inkblot.css"

var story;
try {
    storyContent = require(`./${inkFile}.json`);
    require("./ink.js");
    story = new inkjs.Story(storyContent);
} catch (exception) {
    try {
    const inkjs = require('inkjs/full');
    const data = require(`./${inkFile}.ink`);
    story = new inkjs.Compiler(data).Compile();
    } catch (exception2) {
        console.log(exception);
        console.log(exception2);
    } 
}

const body = document.querySelector("body");
const paper = document.createElement("div");
paper.classList.add("inkblotChat");
paper.classList.add("button");
paper.classList.add("box");
paper.classList.add("inkblotPaper");
body.appendChild(paper);
//document.documentElement.style.setProperty("--thinkingTime", str(thinkingTime) + "s");

function updateMessages(newMessages, messagesElement) {
    let lastAvatar = null;

    for (var i = 0; i < newMessages.length; i++) {
        if ((i == 0 && !newMessages[i].isButton) || i > 0 && !newMessages[i].isButton && newMessages[i-1].isButton) {
            const avatar = document.createElement('div');
            const avatarImg = document.createElement("img");
            avatarImg.src = inkBlotImage;
            avatar.appendChild(avatarImg);
            avatar.classList.add("inkblotAvatar");
            avatar.classList.add("spinning");
            avatar.style.setProperty("--thinkingTime", String(thinkingTime) + "s");
            messagesElement.appendChild(avatar);
            lastAvatar = avatar;
        }
        messagesElement.appendChild(newMessages[i].element);
    }
    
    if (lastAvatar) {
        lastAvatar.scrollIntoView({ behavior: 'smooth', block: 'end'});
    }

    // Thinking
    setTimeout(() => {
        if (lastAvatar) {
            lastAvatar.classList.remove("spinning");
        }


        let choiceDelay = 0;
        for (var i = 0; i < newMessages.length; i++) {
            if (!newMessages[i].isButton) {
                newMessages[i].element.offsetHeight;
                newMessages[i].element.style.transitionDelay = `${choiceDelay}s`;
                newMessages[i].element.style.opacity = "1";
                newMessages[i].element.style.transform = "translateY(0px)";

                const message = newMessages[i];
                const text = message.text;
                const element = message.element;
                
                const totalDuration = text.length / charsPerSecond;

                let charIndex = 0;
                let count = 0;
                setTimeout(() => {
                    const typeInterval = setInterval(() => {
                        if (count != 0) {
                            let randomChars = '';
                            for (let j = 0; j < randomizeEndSize; j++) {
                                randomChars += randomLetter();
                            }
                            element.innerHTML = text.substring(0, charIndex) + randomChars;
                        } else if (charIndex == text.length - randomizeEndSize) {
                            element.innerHTML = text
                            messagesElement.scrollTop = messagesElement.scrollHeight;
                            clearInterval(typeInterval);
                        } else if (charIndex < text.length) {
                            charIndex++;
                            element.innerHTML = text.substring(0, charIndex);

                            messagesElement.scrollTop = messagesElement.scrollHeight;
                        } else {
                            element.innerHTML = text
                            clearInterval(typeInterval);
                        }
                        count = (count + 1) % randomizeEnd
                    }, (1000 / charsPerSecond) / randomizeEnd)
                }, choiceDelay * 1000);

                choiceDelay += totalDuration + 0.75;
            }
        }

        for (var i = 0; i < newMessages.length; i++) {
            newMessages[i].element.offsetHeight;
            
            newMessages[i].element.style.transitionDelay = `${choiceDelay}s`;
            choiceDelay += 0.5;
            
            newMessages[i].element.style.opacity = "1";
            newMessages[i].element.style.transform = "translateY(0px)";
        }

        // Scroll to show avatar on top
        if (lastAvatar) {
            lastAvatar.scrollIntoView({ behavior: 'smooth', block: 'start'});
        } else {
            messagesElement.scrollTop = messagesElement.scrollHeight;
        }
    }, thinkingTime * 1000);
};

function randomLetter() {
    return String.fromCharCode(33 + Math.floor(Math.random() * 94))
}

function createInkBlot(text, isButton=false) {
    const element = document.createElement("div");
    element.classList.add("box");
    element.classList.add("choice");

    if (isButton) {
        element.innerHTML = text;
        element.classList.add("button");
        element.style = `align-self: flex-end;`;
    } else {
        element.classList.add("typewriter");
    }

    return {text, element, isButton};
}

// Create paper
function createPaper() {
    paper.innerHTML = "";
    paper.classList.remove("button");
    paper.classList.remove("inkblotChat");
    paper.classList.add("inkblotPaper");
    paper.classList.add("box");
    story.ResetState();

    //paper.addEventListener('transitionend', onExpandDone, { once: true })

    // Title
    const titleBar = document.createElement("div");
    titleBar.classList.add("inkblotTitleBar");

    const title = document.createElement("div");
    title.textContent = titleText;
    title.classList.add('inkblotTitle');
    titleBar.appendChild(title);

    // Reset/Close buttons
    const chatButtons = document.createElement("div");
    chatButtons.classList.add("inkblotChatButtons");
    const refresh = document.createElement("img");
    refresh.src = refreshImage;
    refresh.style.width = "1.2em";
    refresh.addEventListener("click", () => {
        restart();
    });
    chatButtons.appendChild(refresh);
    const close = document.createElement("img");
    close.src = closeImage;
    close.style.width = "1.2em";
    close.addEventListener("click", () => {
        createChat();
    })
    chatButtons.appendChild(close);

    titleBar.appendChild(chatButtons);
    paper.appendChild(titleBar);

    // Separation bar
    const bar = document.createElement("hr");
    bar.classList.add("inkblotBar");
    paper.appendChild(bar);

    // Message area
    const messagesElement = document.createElement("div");
    messagesElement.classList.add("box");
    messagesElement.classList.add("inkblotMessagesElement");
    paper.appendChild(messagesElement);

    // Trigger CSS transitions by forcing a reflow before setting final opacity
    messagesElement.offsetHeight;
    titleBar.style.opacity = "1";
    bar.style.opacity = "1";
    messagesElement.style.opacity = "1";

    // Todo: Setup buttons?

    continueStory(true);

    function continueStory(firstTime) {
        var paragraphIndex = 0;
        var delay = 0.0;

        var newMessages = [];
        while (story.canContinue) {
            var paragraphText = story.Continue();
            let message = createInkBlot(paragraphText);
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
                    messagesElement.appendChild(imageElement);

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

            for (var i = 0; i < customClasses.length; i++) {
                message.element.classList.add(customClasses[i]);
            }

            newMessages.push(message);

            // Todo: fade in timer
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

            let message = createInkBlot(choice.text, true);
            newMessages.push(message);

            // Todo: fade in choices

            if (isClickable) {
                let element = message.element;
                function callBack() {

                    // Tell the story where to go next
                    story.ChooseChoiceIndex(choice.index);

                    // And loop
                    continueStory();

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

                    element.classList.remove("button");
                    this.removeEventListener("click", callBack);
                }

                element.addEventListener("click", callBack);
            }
        });

        updateMessages(newMessages, messagesElement);
    }

    // Remove all elements that match the given selector. Used for removing choices after
    // you've picked one, as well as for the CLEAR and RESTART tags.
    function removeAll(selector)
    {
        var allElements = messagesElement.querySelectorAll(selector);
        for(var i=0; i<allElements.length; i++) {
            var el = allElements[i];
            el.parentNode.removeChild(el);
        }
    }

    // Used for hiding and showing the header when you CLEAR or RESTART the story respectively.
    function setVisible(selector, visible)
    {
        var allElements = messagesElement.querySelectorAll(selector);
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

    function restart() {
        messagesElement.innerHTML = "";
        story.ResetState();
        setVisible(".header", true);

        continueStory(true);
    }
}

function createChat() {
    paper.innerHTML = "";
    paper.classList.remove("box");
    paper.classList.remove("inkblotPaper");
    paper.classList.add("button");
    paper.classList.add("inkblotChat");
    
    const chatImage = document.createElement("img");
    chatImage.src = inkBlotImage;
    chatImage.classList.add("inkblotIcon");
    paper.appendChild(chatImage);

    chatImage.offsetHeight;
    chatImage.style.opacity = "1";

    chatImage.addEventListener("click", createPaper, { once: true });
}

createChat();