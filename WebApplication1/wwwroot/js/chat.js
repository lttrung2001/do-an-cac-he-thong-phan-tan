"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
connection.start();
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

var otherMessage = (username, message) => {
    return `<li class="clearfix">
                                <div class="message-data text-right"> <span class="message-data-time">${username}</span></div>
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

document.getElementById("btnJoin").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var password = document.getElementById("passwordInput").value;
    if (user != null && user != '' && password != null && password != '') {
            connection.invoke("Join", user, password).then(function (isCorrect) {
                if (isCorrect) {
                    connection.invoke("GetOnlines", user).then((result) => {
                        const args = JSON.parse(result);
                        console.log(args);
                        const userList = document.getElementById('user-list');
                        for (var i = 0; i < args.length; i++) {
                            userList.append(toNodes(userElement(args[i].Id.trim(), args[i].Name)));
                        }
                    })
                    
                    connection.on("ReceiveMessage", function (senderId, senderName, message, receiverId) {
                        var myUser = document.getElementById("userInput").value;
                        var ul = document.getElementById('chat-history-container');
                        senderName = senderName.trim();
                        if (receiverId === 'group' && document.getElementById('group').classList.contains("active")) {
                            if (senderName === myUser) {
                                ul.append(toNodes(myMessage(message)));
                            } else {
                                ul.append(toNodes(otherMessage(senderName, message)));
                            }
                        } else if (senderName === myUser && document.getElementById(receiverId).classList.contains("active")) {
                            ul.append(toNodes(myMessage(message)));
                        } else if (senderName !== myUser && document.getElementById(senderId).classList.contains("active")) {
                            ul.append(toNodes(otherMessage(senderName, message)));
                        }
                    });

                    connection.on('Join', function (id, user) {
                        if (document.getElementById(id.trim()) == null) {
                            document.getElementById('user-list').append(toNodes(userElement(id, user)));
                        }
                    })

                    connection.on('Leave', function (id) {
                        document.getElementById(id).remove();
                    })

                    document.getElementById("sendButton").disabled = false;
                    document.getElementById("btnLeave").disabled = false;
                    document.getElementById("userInput").disabled = true;
                    document.getElementById("btnJoin").disabled = true;
                    document.getElementById("passwordInput").disabled = true;
                }
            }).catch(function (err) {
                return console.error(err.toString());
            });
    }
    event.preventDefault();
});

document.getElementById("btnLeave").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    connection.invoke("Leave", user).then(function () {
        connection.off("GetOnlines");
        connection.off("ReceiveMessage");
        connection.off("Join");
        connection.off("Leave");
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
    document.getElementById("passwordInput").disabled = false;
    event.preventDefault();
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    var receiverId = document.querySelector('#user-list > li.active').id;
    connection.invoke("SendMessage", message, receiverId).then(() => {
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