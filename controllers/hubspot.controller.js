const bCrypt = require('bcryptjs');
const req = require('request');
const connection = require('./../config/connection');

function getPurchase(request, response) {
    let user_id = 201;

    getClient(user_id, (res) => {
        response.send(res);
    });
}

/* 
Função que permite ir buscar os dados do cliente 
Necessita do id do cliente (no hubspot)
Retoma: o id do cliente no hubspot, moloni e jasmin, nome e apelido, email, nº mecanográfico e bilhetes disponíveis
*/

function getClient(user_id, callback) {
    let options = {
        url: `https://api.hubapi.com/contacts/v1/contact/vid/${user_id}/profile?hapikey=${connection.hubspot.key}`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            let user = JSON.parse(res.body);
            let data = user.properties;

            let moloni_id;
            let jasmin_id;
            if (data.moloni_id.value){
                moloni_id = data.moloni_id.value;
            } else {
                moloni_id = "Não aplicável";
            }

            if (data.jasmin_id.value){
                jasmin_id = data.jasmin_id.value;
            } else {
                jasmin_id = "Não aplicável";
            }

            const result = '{ "ID":"'+data.hs_object_id.value+'","ID do Moloni":"'+moloni_id+'","ID do Jasmin":"'+jasmin_id+'","Nome":"'+data.firstname.value+'","Apelido":"'+data.lastname.value+'","Email":"'+data.email.value+'","Número Mecanográfico":"'+data.no_mecanografico.value+'","Bilhetes Disponíveis (Barquense)":"'+data.bilhetes_disponiveis.value+'","Bilhetes Disponíveis (Trandev)":"'+data.bilhetes_disponiveis_transdev.value+'"}';
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