var users = []

// add user
const addUser = ({id, username, room}) => {
    
    if(!username || ! room){
        return {error: 'Username and room name cannot be empty'}
    }

    const existingUser = users.find((_user) => {
        return _user.room === room && _user.username === username
    })

    if(existingUser){
        return {error: 'User with same name already exists in a room'}
    }

    const user = {id, username, room}
    users.push(user)

    return user
}

// remove user
const removeUser = (id) => {

    const DisconnectedUser = getUser(id);

    users =  users.filter(user => user.id != id)

    return DisconnectedUser

}

// get users in a room
const getUsersInRoom = (room) => {
    const usersInRoom = []

    users.find((_user) => { 
        if(_user.room === room){
            usersInRoom.push(_user)
        }
    })

    return usersInRoom
}

// get user
const getUser = (id) => {
    const found = users.find(element => element.id === id);
    return found
}

module.exports = {
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
}
