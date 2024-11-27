// const users = [];

// // Join user to chat 

// function userJoin(id,username,room) {

//     // Check if username already exists in the room
//     const existingUser = users.find(user => 
//         user.username.toLowerCase() === username.toLowerCase() && 
//         user.room === room
//     );

//     // If user already exists in the room, return null
//     if (existingUser) {
//         return null;
//     }

    
//     const user = {id, username ,room};
//     users.push(user);

//     return user ; 
// }

// // To get the current user 

// function getCurrentUser(id){
//     return users.find(user =>user.id ===id  );
// }

// // Now , if user leaves the chat 

// function userLeave(id){
//     const index = users.findIndex(user => user.id === id );

//     if (index !== -1) {
//         // if user not found then remove using splice
//         return users.splice(index,1)[0];
//     }
// }

// // Get room users 
// function getRoomUsers(room) {
//     return users.filter(user =>user.room === room );
// }

// module.exports = {
//     userJoin,
//     getCurrentUser,
//     userLeave,
//     getRoomUsers

// }

const users = [];

// Tracking active sessions per room
const activeSessions = new Map();

function userJoin(id, username, room) {
    // Normalize username for consistent comparison
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedRoom = room.trim();

    // Check if the username is already in use in this room
    const existingUser = users.find(user => 
        user.username.toLowerCase() === normalizedUsername && 
        user.room.toLowerCase() === normalizedRoom
    );

    // Check if there's an active session in this room
    const activeSessionInRoom = activeSessions.get(normalizedRoom);

    // If username exists or room already has an active session
    if (existingUser || activeSessionInRoom) {
        return null;
    }

    // Create new user object
    const user = { 
        id, 
        username: normalizedUsername, 
        room: normalizedRoom,
        sessionStartTime: Date.now()
    };

    // Remove any previous users from this room
    const previousRoomUsers = users.filter(u => u.room.toLowerCase() === normalizedRoom);
    previousRoomUsers.forEach(prevUser => {
        const index = users.findIndex(u => u.id === prevUser.id);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });

    // Add new user
    users.push(user);

    // Set active session for this room
    activeSessions.set(normalizedRoom, {
        username: normalizedUsername,
        sessionStartTime: Date.now()
    });

    return user;
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        const user = users[index];
        
        // Remove from users array
        const removedUser = users.splice(index, 1)[0];
        
        // Clear the active session for this room
        if (removedUser) {
            activeSessions.delete(removedUser.room.toLowerCase());
        }

        return removedUser;
    }
}

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function getRoomUsers(room) {
    return users.filter(user => user.room.toLowerCase() === room.toLowerCase());
}

function getActiveSession(room) {
    return activeSessions.get(room.toLowerCase()) || null;
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getActiveSession
};