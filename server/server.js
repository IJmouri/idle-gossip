const path = require('path');
const http = require('http');

const express = require('express');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname,"/../public"); 
const port = process.env.PORT || 3000

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
app.use(express.static(publicPath));

io.on('connection',(socket) => {
    console.log("A new user just connect");

    
    socket.emit('NewMessage',{
        from: "Admin",
        text: "Welcome",
        createdAt: new Date().getTime()
    });
    socket.broadcast.emit('NewMessage',{
        from: "Admin",
        text: "New user joined",
        createdAt: new Date().getTime()
    });

    socket.on('createMessage',(message) =>{
        console.log('createMessage',message);

        io.emit('NewMessage',{
            from: message.from,
            text: message.text,
            createdAt: new Date().getTime()
        })
    });

    socket.on('disconnect',() => {
        console.log('User disconnected from sever');
    })
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})