const path = require('path');
const http = require('http');

const express = require('express');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || 3000

const { generateMessage, generateLocationMessage } = require("./details/message");
const isRealString = require('./details/isRealString');
const { User } = require('./details/users');
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new User();
app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log("A new user just connect");

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback('Name and room are required');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));


        socket.emit('NewMessage', generateMessage('Admin', 'Welcome to the Idle Gossip App!'));

        socket.broadcast.to(params.room).emit('NewMessage', generateMessage('Admin', 'New user joined'));

        callback();
    })

    socket.on('createMessage', (message, callback) => {
        // console.log('createMessage', message);
        let user = users.getUser(socket.id);
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('NewMessage', generateMessage(user.name, message.text));

        }
        callback();

    });

    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('NewLocationMessage', generateLocationMessage(user.name, coords.lat, coords.lng));
            
        }
    })

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('NewMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room`));
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})