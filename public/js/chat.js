const socket = io();

// Elements
const messageForm = document.querySelector('.messageForm')[0]
const messageTextarea = document.querySelector('#message') 
const messageSubmit = document.querySelector('#messageSubmit')
const locationSendButton = document.querySelector('#location')
const messages = document.querySelector('#messages')
const usersInRoom = document.querySelector('#users-in-room')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const joinedRoomTemplate = document.querySelector('#joined-room-template').innerHTML
const serverMessageTemplate = document.querySelector('#server-msg-template').innerHTML


// Query Parsing
const { userName, roomName} = Qs.parse(location.search, {ignoreQueryPrefix: true})
document.querySelector('#room-name').innerText = roomName

socket.on('newUserConnected', (msg) => {
    // console.log(msg)
    
})


socket.on('newUserConnectedMessage', (msg) => {

    const html = Mustache.render(joinedRoomTemplate, {message: msg.text, time: msg.createdAt})
    var htmlObject = document.createElement('div');
    htmlObject.innerHTML = html;

    messages.insertAdjacentElement('beforeend', htmlObject)

    scrollBot()
})

// Listen for Message from server
socket.on('sendMessageFromServer', (msg) => {
    
    const html = Mustache.render(messageTemplate, {message: msg.text, time: msg.createdAt, userName: msg.userName})
    var htmlObject = document.createElement('div');
    htmlObject.innerHTML = html;

    messages.insertAdjacentElement('beforeend', htmlObject)

    scrollBot()

})

socket.on('sendHelp', (list) => {

    let counter = 1;

    const html = Mustache.render(serverMessageTemplate, {message: `Members in the room are:`})
    var htmlObject = document.createElement('div');
    htmlObject.innerHTML = html;

    messages.insertAdjacentElement('beforeend', htmlObject)

    list.forEach(element => {
        const html3 = Mustache.render(serverMessageTemplate, {message: `${counter++}. ${element}`})
        var htmlObject = document.createElement('div');
        htmlObject.innerHTML = html3;

        messages.insertAdjacentElement('beforeend', htmlObject)
    });  
    
    const html2 = Mustache.render(serverMessageTemplate, {message: `Commands \n 1. :help - for help\n2. :mem - for getting members in the room.`})
    var htmlObject = document.createElement('div');
    htmlObject.innerHTML = html2;
    
    scrollBot()
})

socket.on('sendLocationFromServer', ({coords, userName}) => {
    
    const html = Mustache.render(locationTemplate, {locationLink: coords, name: userName})
    var htmlObject = document.createElement('div');
    htmlObject.innerHTML = html;

    messages.insertAdjacentElement('beforeend', htmlObject)

    scrollBot()
})

document.getElementsByClassName('messageForm')[0].addEventListener('submit', (e)=>{
    e.preventDefault()

    messageSubmit.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    /* 
        COMMANDS
        :help
        :members

    */
    switch(message){

        case ':help':
            socket.emit('askHelp', {userName}, () => {
                // message acknowledgement
                messageSubmit.removeAttribute('disabled')
                messageTextarea.value = ''
            })
            break;

        case ':members':
            console.log('members :)')
            break;

        default:
            socket.emit('sendMessageFromClient', {message, userName, roomName}, () => {
                // message acknowledgement
                messageSubmit.removeAttribute('disabled')
                messageTextarea.value = ''
            })
            
    }  

})

document.getElementById('location').addEventListener('click', () => {

    locationSendButton.setAttribute('disabled', 'disabled')
    
    if(!navigator.geolocation){
        return alert('Your browser dosent support geolocation')
    }
    
    navigator.geolocation.getCurrentPosition((position) => {

        let gmapURL = "https://www.google.com/maps?q=" + position.coords.latitude + ',' + position.coords.longitude
        socket.emit('sendLocation', {gmapURL, userName}, () => {
            console.log('Location Shared!')
        })

        locationSendButton.removeAttribute('disabled')
    })
})

// scroll to bot
function scrollBot(){
    var objDiv = document.getElementsByClassName("chat-history")[0];
    objDiv.scrollTop = objDiv.scrollHeight;
}

socket.emit('join', {userName, roomName})