"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

const toNodes = html =>
    new DOMParser().parseFromString(html, 'text/html').body.childNodes[0]

var userElement = (id, name) => {
    return `<li id="${id}" class="clearfix">
                            <img src="https://bootdey.com/img/Content/avatar/avatar2.png" alt="avatar">
                            <div class="about">
                                <div class="name">${name}</div>
                                <div class="status"> <i class="fa fa-circle online"></i> online </div>
                            </div>
                        </li>`
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