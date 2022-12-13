"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
let historyChat = []

const toNodes = html =>
    new DOMParser().parseFromString(html, 'text/html').body.childNodes[0]

var userElement = (id, name) => {
    let randomId = Math.floor(Math.random() * 8 + 1);
    return `<li id="${id} - ${randomId}" class="clearfix" onclick="handleClick(this.id)">
                            <img class="img" src="https://bootdey.com/img/Content/avatar/avatar${randomId}.png" alt="avatar">
                            <div class="about">
                                <div class="name">${name}</div>
                                <div class="status"> <i class="fa fa-circle online"></i> online </div>
                            </div>
                        </li>`
}

var handleClick = (id) => {
    var myUser = document.getElementById("userInput").value;

    var ulHistoryChat = document.getElementById('chat-history-container');
    let user = document.getElementById(`${id}`).querySelector('.name').textContent;
    let status = document.getElementById(`${id}`).querySelector('.status').textContent;
    let image = document.getElementById(`${id}`).querySelector('.img').src;
    let chatAbout = document.querySelector('.chat-header').querySelector('.chat-about');
    let oldh6 = document.querySelector('.chat-header').querySelector('h6')
    oldh6.remove()
    let oldsmall = document.querySelector('.chat-header').querySelector('small')
    oldsmall.remove()
    let oldimg = document.querySelector('.chat-header').querySelector('img')
    oldimg.remove()
    let newh6 = document.createElement('h6');
    newh6.textContent = user;
    newh6.classList.add('m-b-0')
    let newsmall = document.createElement('small');
    newsmall.textContent = status;
    let newimg = document.createElement('img');
    newimg.src = image
    chatAbout.appendChild(newh6)
    chatAbout.appendChild(newsmall)
    chatAbout.appendChild(newimg)

    let activeElement = document.querySelector('.active');
    activeElement.classList.remove('active');

    let newActiveElement = document.getElementById(`${id}`)
    newActiveElement.classList.add('active')

}

var myMessage = (message) => {
    return `<li class="clearfix">
                                <div class="message other-message float-right"> ${message} </div>
                            </li>`
}

var otherMessage = (user, message) => {
    return `<li class="clearfix">
                                <div class="message-data">
                                    <span class="message-data-time">${user}</span>
                                </div>
                                <div class="message my-message">${message}</div>
                            </li>`
}

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;
document.getElementById("btnLeave").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${user} says ${message}`;
    var myUser = document.getElementById("userInput").value;
    var ul = document.getElementById('chat-history-container');
    if (user === myUser) {
        ul.append(toNodes(myMessage(message)));
    } else {
        ul.append(toNodes(otherMessage(user, message)));
    }
});

document.getElementById("btnJoin").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    if (user != null && user != '') {
        connection.start().then(function () {
        connection.invoke("Join", user);
            connection.on('GetOnlines', (args) => {
                console.log(args);
            var userList = document.getElementById('user-list');
            for (var i = 0; i < args.length; i++) {
                userList.append(toNodes(userElement(args[i].id, args[i].name)));
            }
        });
        }).catch(function (err) {
            return console.error(err.toString());
        });
        document.getElementById("sendButton").disabled = false;
        document.getElementById("btnLeave").disabled = false;
        document.getElementById("userInput").disabled = true;
        document.getElementById("btnJoin").disabled = true;
    }
    event.preventDefault();
});

document.getElementById("btnLeave").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    connection.invoke("Leave", user).then(function () {
        connection.stop();
    }).catch(function (err) {
        return console.error(err.toString());
    });
    document.getElementById("sendButton").disabled = true;
    document.getElementById("btnLeave").disabled = true;
    document.getElementById("userInput").disabled = false;
    document.getElementById("btnJoin").disabled = false;
    event.preventDefault();
});

connection.on('Join', function (id, user) {
    document.getElementById('user-list').append(toNodes(userElement(id, user)));
})

connection.on('Leave', function (id, user) {
    document.getElementById(id).remove();
})

connection.on("PrivateMessage", function (user, message) {
    alert(`${user} says ${message}.`);
})

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    document.getElementById("messageInput").value = "";
    connection.invoke("SendMessage", user, message).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

document.getElementById("sendPrivateButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var receiver = document.getElementById("receiver").value;
    var message = document.getElementById("messagePrivateInput").value;
    connection.invoke("SendPrivateMessage", user, message, receiver).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});


let groupElement = document.querySelector('#user-list').querySelector('li');
groupElement.addEventListener('click', e => {
    let activeElement = document.querySelector('.active');
    activeElement.classList.remove('active');
    groupElement.classList.add('active')
})