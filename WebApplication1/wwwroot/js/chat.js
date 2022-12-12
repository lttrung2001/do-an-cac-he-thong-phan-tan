"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();0

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    // We can assign user-supplied strings to an element's textContent because it
    // is not interpreted as markup. If you're assigning in any other way, you 
    // should be aware of possible script injection concerns.
    li.textContent = `${user} says ${message}`;
});

connection.on("NewConnection", function (id) {
    alert(`${id} has joined.`);
})

connection.on("PrivateMessage", function (user, message) {
    alert(`${user} says ${message}.`);
})
    
connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
    connection.invoke("OnConnected").catch(function (err) {
        return console.error(err.toString());
    })
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
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