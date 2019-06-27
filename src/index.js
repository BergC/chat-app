const path = require('path'); // Path is core Node module. Doesn't need to be installed with NPM.
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

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

    socket.emit('message', 'Welcome!');

    socket.broadcast.emit('message', 'A new user has joined!');

    socket.on('sendMessage', (message) => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!');
    });
});

// Listening for our server.
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});