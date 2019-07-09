const users = [];

// Track new user.
const addUser = ({ id, username, room }) => {
    // Clean data.
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate data.
    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    }

    // Check for existing user in room.
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // Validate username.
    if (existingUser) {
        return {
            error: 'Username is already in use for this room.'
        }
    }

    // Store valid user.
    const user = { id, username, room }
    users.push(user);
    return { user }
}

// Stop tracking user when user leaves.
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Fetch existing users data.
const getUser = (id) => {
    return users.find((user) => user.id === id);
}

// Get complete list of all users in a room.
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}