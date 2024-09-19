const socket = io()

const clientTotal = document.getElementById('client-total');
const msgContainer = document.getElementById('msg-container');
const nameInput = document.getElementById('name-input');
const msgForm = document.getElementById('msg-form');
const msgInput = document.getElementById('msg-input');

msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
})

// total client connected
socket.on('clients-total', (data) => {
    console.log(data);
    clientTotal.innerText = `Total Clients: ${data}`;
})

function sendMessage() {
    if (msgInput.value === '') return
    const data = {
        name: nameInput.value,
        message: msgInput.value,
        dateTime: new Date()
    }
    socket.emit('message', data);
    castMsgToUI(true, data);
    msgInput.value = '';
}

// chat message
socket.on('chat-message', (data) => {
    console.log(data)
    castMsgToUI(false, data);
})

function castMsgToUI(isOwnMsg, data) {
    const element = `
            <li class="${isOwnMsg ? "msg-right" : "msg-left"}">
                <p class="msg">
                    ${data.message}
                    <span>${data.name} . ${moment(data.dateTime).fromNow()}</span>
                </p>
            </li>
            `;
    msgContainer.innerHTML += element;
    scrollToBottom();
}

function scrollToBottom() {
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
}

msgInput.addEventListener('focus', (e) => {
    socket.emit('feedback', {
        feedback: `✍️ ${nameInput.value} is typing ...`
    })
});

msgInput.addEventListener('keypress', (e) => {
    socket.emit('feedback', {
        feedback: `✍️ ${nameInput.value} is typing ...`
    })
});

msgInput.addEventListener('blur', (e) => {
    socket.emit('feedback', {
        feedback: ''
    })
});

// feedback
socket.on('feedback', (data) => {
    clearFeedback();d
    const element = `
            <li class="msg-feedback">
                <p class="feedback" id="feedback">
                    ${data.feedback}
                </p>
            </li>
            `;
            msgContainer.innerHTML += element;
});

function clearFeedback() {
    document.querySelectorAll('li.msg-feedback').forEach(element => {
        element.parentNode.removeChild(element)
    })
}