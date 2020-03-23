const bCrypt = require('bcryptjs');
const req = require('request');
const connection = require('./../config/connection');

function getPurchase(request, response) {
    let user_id = 151;
    
    let options = {
        url: `https://api.hubapi.com/contacts/v1/contact/vid/${user_id}/profile?hapikey=${connection.hubspot.key}`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            let user = JSON.parse(res.body);
            response.send(user.properties);
        }
    })
}

function generatePass() {
    const length = 25,
        charSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0; i < length; ++i) {
        retVal += charSET.charAt(Math.floor(Math.random() * charSET.length));
    }
    return retVal;
}

module.exports = {
    getPurchase: getPurchase
};