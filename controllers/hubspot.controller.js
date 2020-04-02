const bCrypt = require('bcryptjs');
const req = require('request');
const connection = require('./../config/connection');

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
            if (data.moloni_id.value) {
                moloni_id = data.moloni_id.value;
            } else {
                moloni_id = "Não aplicável";
            }

            if (data.jasmin_id.value) {
                jasmin_id = data.jasmin_id.value;
            } else {
                jasmin_id = "Not available";
            }


            const result = {
                "user_id": data.hs_object_id.value,
                "moloni_id": moloni_id,
                "jasmin_id": jasmin_id,
                "nome": data.firstname.value,
                "apelido": data.lastname.value,
                "email": data.email.value,
                "numero_mecanografico": data.no_mecanografico.value,
                "bilhetes_disponiveis_barquense": data.bilhetes_disponiveis_barquense.value,
                "bilhetes_disponiveis_transdev": data.bilhetes_disponiveis_transdev.value,
                "nif": data.nif.value
            }
            callback({
                "user": result
            });
        } else {
            callback({
                "statusCode": res.statusCode,
                "body": JSON.parse(res.body)
            })
        }
    })
}

function updateClient(user_id, properties, callback) {
    let json = {
        "properties": [
           properties
        ]
    }
    let options = {
        headers: {
            'Content-Length': JSON.stringify(json).length,
            'Content-Type': 'application/json'
        },
        url: `https://api.hubapi.com/contacts/v1/contact/vid/${user_id}/profile?hapikey=${connection.hubspot.key}`,

        body: JSON.stringify(json)
    }

    req.post(options, (err, res) => {
        if (!err && res.statusCode == 204) {
            callback({
                "statusCode": 200,
                "body": {
                    "message": "Updated with sucess"
                }
            })
        } else {
            callback({
                "statusCode": res.statusCode,
                "body": JSON.parse(res.body)
            })
        }
    })
}

module.exports = {
    getClient: getClient,
    updateClient: updateClient
};