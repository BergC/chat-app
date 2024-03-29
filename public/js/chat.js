const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }); // QS gives us access to the Chrome dev tools location.search, which is the users query string.

const autoscroll = () => {
    // New message element.
    const $newMessage = $messages.lastElementChild;

    // Height of the new message.
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height.
    const visibleHeight = $messages.offsetHeight;

    // Messages container height.
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

// Send a message.
socket.on('message', (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    });
    
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

// Send current location link.
socket.on('locationMessage', (location) => {
    console.log(location);

    const html = Mustache.render(locationMessageTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('HH:mm')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

$messageForm.addEventListener('submit', (e) => {
    // Prevent the page from doing a full refresh.
    e.preventDefault();

    //Disable form.
    $messageFormButton.setAttribute('disabled', 'disabled');

    // Targets the HTML element we're listening for our event on and accesses the message element.
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        // Re-enable form.
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Message delivered.');
    });
});

// Render users in room.
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    document.querySelector('#sidebar').innerHTML = html;
});

// Send location.
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message) => {
            console.log(message);
            $sendLocationButton.removeAttribute('disabled');
        });
    });
});

// Join specific chat room.
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);

        location.href = '/'
    }
});