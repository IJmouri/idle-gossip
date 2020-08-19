let socket = io();
socket.on('connect', function (){
    console.log('connected to the sever');
});
socket.on('disconnect', function(){
    console.log('disconnected from sever');
})

socket.on('NewMessage', function(message){
    console.log('NewMessage',message);
})