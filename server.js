
const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const formatMessage = require('./public/utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./public/utils/users')
const app = express();

// To create a server we need to use http which is in express
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

// Set static folder using static and give path in it
app.use(express.static(path.join(__dirname, 'public')));

// Chatify Bot username
const userName = 'Chatify Bot';

// Hardcoded admin password
const ADMIN_PASSWORD = 'admin';

// Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room, password}) => {
        // Check if the provided password is correct
        if (password !== ADMIN_PASSWORD) {
            socket.emit('passwordError', { 
                message: 'Incorrect password. Access denied.'
            });
            return;
        }

        // Join user to chat and check for username conflict
        const user = userJoin(socket.id, username, room);
        
        // If username is already in use in the room
        if (!user) {
            // Emit event to notify client about username conflict
            socket.emit('usernameTaken', { 
                message: `Username "${username}" is already in use in the "${room}" room.`
            });
            return;
        }

        // Join the specific room
        socket.join(user.room);
          
        // Welcome current user
        socket.emit('message', formatMessage(userName, 'Welcome to Chatify - Kuvaka Tech'));

        // Broadcast when a user connects to everyone in the room except the user
        socket.broadcast.to(user.room).emit('message', 
            formatMessage(userName, `${user.username} has joined the chat`)
        );
   
        // Send users and room info 
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Runs When a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        if (user) {
            io.to(user.room).emit('message', 
                formatMessage(userName, `${user.username} has left the chat`)
            );

            // Send users and room info 
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

    // Listen for chat Message 
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        
        // Emit message to the specific room
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
});

// Start the server
server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));