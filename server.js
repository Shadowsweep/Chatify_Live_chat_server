// const path = require('path');
// const http = require('http');
// const express = require('express');
// const socketio = require('socket.io')
// const formatMessage = require('./public/utils/messages')
// const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./public/utils/users')
// const app = express();

// // To create a server we need to use http which is in express
// const server = http.createServer(app);
// const io = socketio(server);

// const PORT = process.env.PORT || 3000;

// // Set static folder using static and give path in it
// app.use(express.static(path.join(__dirname, 'public')));

// // Chatify Bot username
// const userName = 'Chatify Bot';

// // Run when a client connects
// io.on('connection', socket => {
//     socket.on('joinRoom', ({username, room}) => {
//         // Join user to chat and check for username conflict
//         const user = userJoin(socket.id, username, room);
        
//         // If username is already in use in the room
//         if (!user) {
//             // Emit event to notify client about username conflict
//             socket.emit('usernameTaken', { 
//                 message: `Username "${username}" is already in use in the "${room}" room.`
//             });
//             return;
//         }

//         // Join the specific room
//         socket.join(user.room);
          
//         // Welcome current user
//         socket.emit('message', formatMessage(userName, 'Welcome to Chatify - Kuvaka Tech'));

//         // Broadcast when a user connects to everyone in the room except the user
//         socket.broadcast.to(user.room).emit('message', 
//             formatMessage(userName, `${user.username} has joined the chat`)
//         );
   
//         // Send users and room info 
//         io.to(user.room).emit('roomUsers', {
//             room: user.room,
//             users: getRoomUsers(user.room)
//         });
//     });

//     // Runs When a client disconnects
//     socket.on('disconnect', () => {
//         const user = userLeave(socket.id);
        
//         if (user) {
//             io.to(user.room).emit('message', 
//                 formatMessage(userName, `${user.username} has left the chat`)
//             );

//             // Send users and room info 
//             io.to(user.room).emit('roomUsers', {
//                 room: user.room,
//                 users: getRoomUsers(user.room)
//             });
//         }
//     });

//     // Listen for chat Message 
//     socket.on('chatMessage', msg => {
//         const user = getCurrentUser(socket.id);
        
//         // Emit message to the specific room
//         io.to(user.room).emit('message', formatMessage(user.username, msg));
//     });
// });

// // Start the server
// server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const formatMessage = require('./public/utils/messages')
const {
    userJoin, 
    getCurrentUser, 
    userLeave, 
    getRoomUsers,
    getActiveSession
} = require('./public/utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const userName = 'Chatify Bot';

io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        // Validate input
        if (!username || !room) {
            socket.emit('joinError', { 
                message: 'Username and room are required.',
                redirect: true
            });
            return;
        }

        // Check for existing active session
        const activeSession = getActiveSession(room);
        if (activeSession) {
            socket.emit('joinError', {
                message: `Room "${room}" is currently in use. Please try another room.`,
                redirect: true
            });
            return;
        }

        // Attempt to join room
        const user = userJoin(socket.id, username, room);
        
        // Handle join failure
        if (!user) {
            socket.emit('joinError', {
                message: `Unable to join room. Username may already be in use.`,
                redirect: true
            });
            return;
        }

        // Join the specific room
        socket.join(user.room);
          
        // Welcome current user
        socket.emit('message', formatMessage(userName, 'Welcome to Chatify - Kuvaka Tech'));

        // Broadcast to room
        socket.broadcast.to(user.room).emit('message', 
            formatMessage(userName, `${user.username} has joined the chat`)
        );
   
        // Send users and room info 
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Existing disconnect handler
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        if (user) {
            io.to(user.room).emit('message', 
                formatMessage(userName, `${user.username} has left the chat`)
            );

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

    // Chat message handler
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        
        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, msg));
        }
    });
});

server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));