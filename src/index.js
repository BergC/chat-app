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

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', (socket) => {
    console.log('New WebSocket connection.');

    socket.emit('countUpdated', count);

    socket.on('increment', () => {
        count++
        io.emit('countUpdated', count);
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})