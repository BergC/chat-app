const path = require('path'); // Path is core Node module. Doesn't need to be installed with NPM.
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

// Create Express application.
const app = express();

// Create the HTTP server using the Express app.
const server = http.createServer(app);

// Connect socket.io to the server.
const io = socketio(server);

// Set-up our port.
const port = process.env.PORT || 3000;

// Using Express to serve up client side directory.
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// First draft chat app between client and server using logs.
io.on('connection', (socket) => {
    console.log('New WebSocket connection.');

    socket.on('join', ({ username, room }) => {
        socket.join(room);

        socket.emit('message', generateMessage('Welcome!'));

        // Send a message to all connected clients in a specific room but the newly joined user.
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }
        
        io.to('Cars').emit('message', generateMessage(message));

        callback();
    });

    socket.on('sendLocation', (coordinates, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`));
        callback('Location shared!');
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'));
    });
});

// Listening for our server.
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});