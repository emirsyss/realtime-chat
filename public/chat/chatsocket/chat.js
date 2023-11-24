// Sunucuya bağlan
const socket = io.connect('http://localhost:3000');
const chatContainer = document.getElementById('allmessages');

// Sunucudan gelen mesajları p öğeleri olarak chat-container'a ekle
function showMessages(messages) {
    messages.forEach(message => {
        const fullMessageDiv = document.createElement('div'); //Avatar ve Mesajın olduğu div
    fullMessageDiv.setAttribute('id', 'fullMessageDiv')
        const avatarDiv = document.createElement('div'); // Avatarın olduğu div
        avatarDiv.setAttribute('id', 'avatarDiv');

        const avatarElement = document.createElement('img'); // Avatar
        avatarElement.src = "avatars/noavatar.png"; // Avatar yolu (ilerde burada kendi API'mizi kodlayıp avatarı çekeceğiz)

        

        avatarDiv.appendChild(avatarElement);
        const messageSenderAndDateElement = document.createElement('p'); // Mesaj
        messageSenderAndDateElement.innerHTML = '<span>' + message.sender + '</span>' + '<span id="datemessage">' + message.date + '</span>'; // Mesaj içeriği <gönderen>: <mesaj>

        const messageElement = document.createElement('p'); // Mesaj
        messageElement.innerHTML = message.message; // Mesaj içeriği <gönderen>: <mesaj>

        const messageDiv = document.createElement('div'); // Mesajın içinde bulunduğu div
        messageDiv.setAttribute('id', 'messageDiv');

        messageDiv.appendChild(messageSenderAndDateElement); // Mesaj divine mesajımızı ekliyoruz
        messageDiv.appendChild(messageElement); // Mesaj divine mesajımızı ekliyoruz

        fullMessageDiv.appendChild(avatarDiv); // fullMessageDiv içine avatarDiv ekliyoruz
        fullMessageDiv.appendChild(messageDiv); // fullMessageDiv içine messageDiv ekliyoruz

        chatContainer.appendChild(fullMessageDiv);
    });
    scrollToBottom();
}

socket.on('messages', messages => {
    showMessages(messages);
});
socket.on('redirect', (url) => {
    window.location.href = url;
});
function scrollToBottom() {
    var messageContainer = document.getElementById("allmessages");
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
function SendMessage() {
    const messageInput = document.getElementById('yourmessage');
    const message = messageInput.value;
    if (message) {
        socket.emit('newMessage', { content: message });
        messageInput.value = '';

    }


}

// Yeni mesaj gönderme
document.getElementById('sendBtn').addEventListener('click', () => {
    SendMessage();
});
document.getElementById('yourmessage').addEventListener('keydown', function (event) {
    if (event.key === "Enter") {
        SendMessage();
    }
})

// Yeni mesajları dinle ve p öğeleri olarak chat-container'a ekle
socket.on('newMessage', message => {
    const fullMessageDiv = document.createElement('div'); //Avatar ve Mesajın olduğu div
    fullMessageDiv.setAttribute('id', 'fullMessageDiv')
        const avatarDiv = document.createElement('div'); // Avatarın olduğu div
        avatarDiv.setAttribute('id', 'avatarDiv');

        const avatarElement = document.createElement('img'); // Avatar
        avatarElement.src = "avatars/noavatar.png"; // Avatar yolu (ilerde burada kendi API'mizi kodlayıp avatarı çekeceğiz)

        

        avatarDiv.appendChild(avatarElement);
        const messageSenderAndDateElement = document.createElement('p'); // Mesaj
        messageSenderAndDateElement.innerHTML = '<span>' + message.sender + '</span>' +  '<span id="datemessage">' + message.date + '</span>'; // Mesaj içeriği <gönderen>: <mesaj>

        const messageElement = document.createElement('p'); // Mesaj
        messageElement.innerHTML = message.content; // Mesaj içeriği <gönderen>: <mesaj>

        const messageDiv = document.createElement('div'); // Mesajın içinde bulunduğu div
        messageDiv.setAttribute('id', 'messageDiv');

        messageDiv.appendChild(messageSenderAndDateElement); // Mesaj divine mesajımızı ekliyoruz
        messageDiv.appendChild(messageElement); // Mesaj divine mesajımızı ekliyoruz

        fullMessageDiv.appendChild(avatarDiv); // fullMessageDiv içine avatarDiv ekliyoruz
        fullMessageDiv.appendChild(messageDiv); // fullMessageDiv içine messageDiv ekliyoruz

        chatContainer.appendChild(fullMessageDiv);

    let containerScrollTop = chatContainer.scrollTop;
    let containerScrollHeight = chatContainer.scrollHeight;
    let containerHeight = chatContainer.clientHeight;

    // Eğer kullanıcı sayfanın en altından 10 piksel yukarıdaysa
    if (containerScrollHeight - containerScrollTop <= 670) {
        scrollToBottom();
    }

});