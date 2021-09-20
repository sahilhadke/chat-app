const moment = require('moment')
moment.locale(); 

const generateMessage = (text, userName) => {

    // const fullDate = 
   
    return{
        text: text,
        userName: userName,
        createdAt:  moment().format('LT')
    }
}

module.exports = {
    generateMessage
}