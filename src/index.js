const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage} = require('./utils/messages')
const users = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


// Called when new user connects
io.on('connection', (socket) => {

  // Listen for joining
  socket.on('join', ({userName, roomName}) => {

    users.addUser({
      id: socket.id,
      username: userName,
      room: roomName
    })

    socket.join(roomName)

    io.to(roomName).emit('dispUsers', users.getUsersInRoom(roomName))


    // io.to.emit | socket.broadcast.emit => room functions
    
    // Sends new user connected message to all the clinets
    io.to(roomName).emit('newUserConnectedMessage', generateMessage(userName +  " joined the room"))     

  })

  // Listens for a message from client
  socket.on('sendMessageFromClient', ({message, userName, roomName}, callback) => {
    io.to(roomName).emit('sendMessageFromServer', generateMessage(message, userName))
    callback()
  })

  // Listens for a help from client
  socket.on('askHelp', ({userName}, callback) => {
    
    const userList = users.getUsersInRoom(users.getUser(socket.id).room)

    const names = userList.map(element => element.username)

    console.log(names)

    socket.emit('sendHelp', names)
    callback()
  })

  // Listen for location
  socket.on('sendLocation', ({coords, userName}, callback) => {
    io.emit('sendLocationFromServer', {coords, userName})
    callback()
  })

  // Called on disconnection
  socket.on('disconnect', () => {
    
    const disconnecteduser = users.removeUser(socket.id)
    if(disconnecteduser){
      io.emit('newUserConnectedMessage', generateMessage(disconnecteduser.username + ' left the room.'))
      io.to(disconnecteduser.room).emit('dispUsers', users.getUsersInRoom(disconnecteduser.room))
    }
    
    
  })
})

app.get('/', (req, res) => {
	res.render()
})

server.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})