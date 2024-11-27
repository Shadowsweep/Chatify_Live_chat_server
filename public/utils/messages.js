const moment = require('moment');

// Through this we are going to get content required for chats
function formatMessage(username , text){
    return{
        username ,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMessage;