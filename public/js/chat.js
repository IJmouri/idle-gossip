let socket = io();

function scrollToBottom() {
    let messages = document.querySelector('#messages').lastElementChild;
    messages.scrollIntoView();
}

socket.on('connect', function () {
    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g, '":"') + '"}');
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log("No error");
        }
    })
});
socket.on('disconnect', function () {
    console.log('disconnected from sever');
});

socket.on('updateUserList', function (users) {
    let ol = document.createElement('ol');
    users.forEach(function (user) {
        let li = document.createElement('li');
        li.innerHTML = user;
        ol.appendChild(li);
    });

    let userList = document.querySelector('#users');
    userList.innerHTML = "";
    userList.appendChild(ol);
});
socket.on('NewMessage', function (message) {
    const formattedTime = moment(message.createdAt).format('LT')

    const template = document.querySelector('#message-template').innerHTML;
    const html = Mustache.render(template, {
        from: message.from,
        text: message.text,
        createdAt: formattedTime
    });

    const div = document.createElement('div');
    div.innerHTML = html

    document.querySelector('#messages').appendChild(div);
    scrollToBottom();

});
socket.on('NewLocationMessage', function (message) {
    console.log('NewLocationMessage', message);
    const formattedTime = moment(message.createdAt).format('LT')
    const template = document.querySelector('#location-message-template').innerHTML;
    const html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });

    const div = document.createElement('div');
    div.innerHTML = html

    document.querySelector('#messages').appendChild(div);

    // document.querySelector('body').appendChild(li);
})

document.querySelector('#submit-btn').addEventListener('click', function (e) {
    e.preventDefault();

    socket.emit("createMessage", {
        from: "User",
        text: document.querySelector('input[name="message"]').value
    }, function () {

    })
});

document.querySelector('#send-location').addEventListener('click', function (e) {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported');
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        socket.emit('createLocationMessage', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        })
    }, function () {
        alert('Unable to fetch location');
    })
})