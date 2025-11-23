// InkChat code
const titleText = "InkChat";
import inkBlotImage from "./media/inkblot-5.png";
import closeImage from "./media/close.svg";
import refreshImage from "./media/refresh.svg";

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
    refresh.src = refreshImage;
    refresh.style.width = "1.2em";
    refresh.addEventListener("click", () => {
        start();
    });
    chatButtons.appendChild(refresh);
    const close = document.createElement("img");
    close.src = closeImage;
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


    /*const scrollTrack = document.createElement("div");
    scrollTrack.style = `
        display:
    `;
    messagesElement.appendChild(scrollTrack);
    const scrollThumb = document.createElement("div");
    scrollThumb.id = "custom-scroll-thumb";
    scrollThumb = `
        transition: height 300ms ease;
    `;
    scrollTrack.appendChild(scrollThumb);
    */
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

    start();
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