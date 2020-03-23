const bCrypt = require('bcryptjs');
const req = require('request');
const connection = require('./../config/connection');

function getPurchase(request, response) {
    let user_id = 201;

    getClient(user_id, (res) => {
        response.send(res);
    });
}

function getClient(user_id, callback) {
    let options = {
        url: `https://api.hubapi.com/contacts/v1/contact/vid/${user_id}/profile?hapikey=${connection.hubspot.key}`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            let user = JSON.parse(res.body);
            let data = user.properties;
            /*let result = "ID: " + data.hs_object_id.value + ";" +
                " Email: " + data.email.value + ";" +
                " Nome: " + data.firstname.value + ";" +
                " Apelido: " + data.lastname.value + ";" +
                " Número Mecanográfico: " + data.no_mecanografico.value + ";" +
                " Bilhetes Disponíveis: " + data.bilhetes_disponiveis.value; */

            const result = '{ "ID":"'+data.hs_object_id.value+'","Email":"'+data.email.value+'","Nome":"'+data.firstname.value+'","Apelido":"'+data.lastname.value+'","Número Mecanográfico":"'+data.no_mecanografico.value+'","Bilhetes Disponíveis":"'+data.bilhetes_disponiveis.value+'"}';
            let resultJSON = JSON.parse(result)
            callback(resultJSON);
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