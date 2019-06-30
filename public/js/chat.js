const socket = io();

socket.on('message', (message) => {
    console.log(message);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
    // Prevent the page from doing a full refresh.
    e.preventDefault();

    // Targets the HTML element we're listening for our event on and accesses the message element.
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message);
});

// Send location functionality.
document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    });
});