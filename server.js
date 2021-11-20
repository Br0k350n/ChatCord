const path = require('path')
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUser} = require('./utils/users')



const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "ChatCord Bot";


app.use(express.static(path.join(__dirname, "public")));



io.on('connection', socket => {
  socket.on('joinRoom', ({username, room}) => {
    const user = userJoin(socket.id,username, room);

    socket.join(user.room);



    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

    socket.broadcast.to(user.room).emit('message', formatMessage(botName, user.username +' has joined the chat!'));
  });


  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });


  socket.on('disconnect', () => {

    const user = userLeave(socket.id);

    if(user) {
      io.to(user.room).emit('message', formatMessage(botName, user.username+' has left the chat'));
    }

  });


});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("server running on port " + PORT));
