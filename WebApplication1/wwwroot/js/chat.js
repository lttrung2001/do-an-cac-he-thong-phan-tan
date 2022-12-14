"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
let historyChat = []

const toNodes = html =>
    new DOMParser().parseFromString(html, 'text/html').body.childNodes[0]

var userElement = (id, name) => {
    let randomId = Math.floor(Math.random() * 8 + 1);
    return `<li id="${id}" class="user-item clearfix" onclick="handleClick(this.id)">
                            <img class="img" src="https://bootdey.com/img/Content/avatar/avatar${randomId}.png" alt="avatar">
                            <div class="about">
                                <div class="name">${name}</div>
                                <div class="status"> <i class="fa fa-circle online"></i> online </div>
                            </div>
                        </li>`
}

var handleClick = (id) => {
    var h6Element = document.querySelector('.chat-about h6');
    var imgElement = document.querySelector('.chat-header img');
    var statusElement = document.querySelector('.chat-header small');
    h6Element.innerHTML = document.getElementById(id).querySelector('.name').innerHTML;
    imgElement.src = document.getElementById(id).querySelector('img').src;
    statusElement.innerHTML = document.getElementById(id).querySelector('.status').textContent;

    let activeElement = document.querySelector('.active');
    activeElement.classList.remove('active');

    let newActiveElement = document.getElementById(`${id}`)
    newActiveElement.classList.add('active')

    document.getElementById('chat-history-container').innerHTML = ""
}

var myMessage = (message) => {
    return `<li class="clearfix">
                                <div class="message other-message float-right"> ${message} </div>
                            </li>`
}

var otherMessage = (message) => {
    return `<li class="clearfix">
                                <div class="message my-message">${message}</div>
                            </li>`
}

var chatHistory = (id, username) => {
    return `<div class="chat-${id}">
                    <div class="chat-header clearfix">
                        <div class="row">
                            <div class="col-lg-6">
                                <a href="javascript:void(0);" data-toggle="modal" data-target="#view_info">
                                    <img src="${image}" alt="avatar">
                                </a>
                                <div class="chat-about">
                                    <h6 class="m-b-0">${username}</h6>
                                    <small>Online</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat-history-${id}">
                        <ul id="chat-history-container-${id}" class="m-b-0">
                        </ul>
                    </div>
                    <div class="chat-message clearfix">
                        <div class="input-group mb-0">
                            <div class="input-group-prepend">
                                <span id="sendButton" class="input-group-text"><i class="fa fa-send"></i></span>
                            </div>
                            <input id="messageInput" type="text" class="form-control" placeholder="Enter text here...">
                        </div>
                    </div>
                </div>`
}

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;
document.getElementById("btnLeave").disabled = true;

connection.on("ReceiveMessage", function (senderId, senderName, message, receiverId) {
    console.log(senderId, senderName, message, receiverId)
    var myUser = document.getElementById("userInput").value;
    var ul = document.getElementById('chat-history-container');
    if (receiverId === 'group' && document.getElementById('group').classList.contains("active")) {
        if (senderName === myUser) {
            ul.append(toNodes(myMessage(message)));
        } else {
            ul.append(toNodes(otherMessage(message)));
        }
    } else if (senderName === myUser && document.getElementById(receiverId).classList.contains("active")) {
        ul.append(toNodes(myMessage(message)));
    } else if (senderName !== myUser && document.getElementById(senderId).classList.contains("active")) {
        ul.append(toNodes(otherMessage(message)));
    }
});

document.getElementById("btnJoin").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    if (user != null && user != '') {
        connection.start().then(function () {
        connection.invoke("Join", user);
            connection.on('GetOnlines', (args) => {
                console.log(args);
                const userList = document.getElementById('user-list');
                for (var i = 0; i < args.length; i++) {
                    userList.append(toNodes(userElement(args[i].id, args[i].name)));
                    //chatApp.append(toNodes(chatHistory(args[i].id, args[i].name)));
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
        const ls = document.querySelectorAll('.user-item');
        for (var i = 0; i < ls.length; i++) {
            ls[i].remove();
        }
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

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    var receiver = document.querySelector('#user-list > li.active').id;
    connection.invoke("SendMessage", message, receiver).then(() => {
        document.getElementById("messageInput").value = "";
    }).catch(function (err) {
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