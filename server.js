
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const formatMessage = require('./public/utils/messages')
const {userJoin ,getCurrentUser ,userLeave ,getRoomUsers} = require('./public/utils/users')
const app = express();

// To create a server we need to use http which is in express
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT

// Set static folder using static and give path in it
app.use(express.static(path.join(__dirname,'public')));

//mention server here  Run when a client connects
// io - Run when a client connects
io.on('connection',socket =>{
    socket.on('joinRoom',({username, room }) =>{
     const user = userJoin(socket.id ,username , room);
    // to get joinroom 
    socket.join(user.room);

          
    socket.emit('message',formatMessage( userName, 'Welcome to Chatify - Kuvaka Tech'));

    // Now we will Broadcast when a user connects  
    // in this everyone will get notified except the user itself 
    socket.broadcast.to(user.room).emit('message',formatMessage(userName,`${user.username} has joined the chat `));
   
        //Send users and room info 
   io.to(user.room).emit('roomUsers',{
    room : user.room,
    users: getRoomUsers(user.room)
  });
   

    } )
    const userName =  'Chatify Bot';
    
 

    // Runs When a client disconnects
    socket.on('disconnect', () =>{
        const user = userLeave(socket.id);
        if(user){
    
            io.to(user.room).emit('message',formatMessage(userName ,`${user.username} has left the chat  `))

             // Send users and room info 
               io.to(user.room).emit('roomUsers',{
               room : user.room,
               users: getRoomUsers(user.room)
               });
}
 } );



    
    // to broad cast everyone  - io.emit()

    // Listen for chat Message 
    socket.on('chatMessage',msg =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username ,msg))
    } )

    
})

server.listen(PORT ,() => console.log(`Server running on PORT : ${PORT}`) )