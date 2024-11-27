const users = [];

// Join user to chat 

function userJoin(id,username,room) {

    // Check if username already exists in the room
    const existingUser = users.find(user => 
        user.username.toLowerCase() === username.toLowerCase() && 
        user.room === room
    );

    // If user already exists in the room, return null
    if (existingUser) {
        return null;
    }

    
    const user = {id, username ,room};
    users.push(user);

    return user ; 
}

// To get the current user 

function getCurrentUser(id){
    return users.find(user =>user.id ===id  );
}

// Now , if user leaves the chat 

function userLeave(id){
    const index = users.findIndex(user => user.id === id );

    if (index !== -1) {
        // if user not found then remove using splice
        return users.splice(index,1)[0];
    }
}

// Get room users 
function getRoomUsers(room) {
    return users.filter(user =>user.room === room );
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers

}