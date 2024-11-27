const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const messageTone = new Audio('js/message-tone.mp3')

// We will get username and room from  URL
const {username,room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


// For clean and clear text using Qs library 
// console.log(username , room);


// Join chatroom 
socket.emit('joinRoom',{ username ,room })

// Handle username taken scenario
socket.on('usernameTaken', (data) => {
  // Alert the user and redirect back to index page
  alert(data.message);
  window.location = 'kuvaka.html';
});


// Get room and Users when we are inside our chatroom 
socket.on('roomUsers',({ room , users}) => {
  outputRoomName(room);
  outputUsers(users);

})



// What we sent on server will be displayed here 
socket.on('message' ,message =>{
    console.log("This is message time ",message);
    outputMessage(message);
     messageTone.play();
    // tO add scroll to Bottom 
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// To create a message submit 
chatForm = addEventListener('submit',(e) =>{
    e.preventDefault();
    // Get message text
    const msg = e.target.elements.msg.value;
   
    // Emit message to server
    socket.emit('chatMessage',msg);

    // clear input
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();


})

// Output message to DOM

function outputMessage(message){

    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`  <p class="text">
                      ${message.text}
                    </p> 
                   <p class="meta">${message.username} &nbsp; <span>${message.time}</span></p>
                   `;
    document.querySelector('.chat-messages').appendChild(div); 
}


// Add room name to DOM 
function outputRoomName(room) {
  roomName.innerText = room;

}

//Add users to DOM
function outputUsers(users){
userList.innerHTML =`
   ${users.map(user => `<li> ${user.username}</li>`).join('') }

`;

}