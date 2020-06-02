const req = require('request');

/*
Função que permite ir buscar os dados de todos os clientes
Retoma: o id, nome e apelido do cliente no hubspot
*/
function getClients(callback) {
    let options = {
        url: `https://api.hubapi.com/contacts/v1/lists/all/contacts/all?hapikey=${process.env.HUBSPOT_KEY}`
    }
    req.get(options, (err, res) => {
        if (!err) {
            if (res.statusCode == 200) {
                const users = JSON.parse(res.body).contacts;

                let usersF = [];
                for (let i = 0; i < users.length; i++) {
                    usersF.push({
                        'id': users[i].vid,
                        'name': users[i].properties.firstname.value + ' ' + users[i].properties.lastname.value,
                    })
                }
                callback({
                    users: usersF
                })
            } else {
                callback({
                    'statusCode': res.statusCode,
                    'body': JSON.parse(res.body)
                })
            }
        } else {
            console.log(err);
            callback({
                'statusCode': 400,
                'body': 'erro'
            })
        }
    })
}

/* 
Função que permite ir buscar os dados do cliente 
Necessita do id do cliente (no hubspot)
Retoma: o id do cliente no hubspot, moloni e jasmin, nome e apelido, email, nº mecanográfico e bilhetes disponíveis
*/

function getClient(user_id, callback) {
    let options = {
        url: `https://api.hubapi.com/contacts/v1/contact/vid/${user_id}/profile?hapikey=${process.env.HUBSPOT_KEY}`
    }
    req.get(options, (err, res) => {
        if (!err) {
            if (res.statusCode == 200) {
                let user = JSON.parse(res.body);
                let data = user.properties;

                const result = {
                    'user_id': data.hs_object_id.value,
                    'moloni_id': (data.moloni_id ? data.moloni_id.value : -1),
                    'jasmin_id': (data.jasmin_id ? data.jasmin_id.value : -1),
                    'nome': data.firstname.value,
                    'apelido': data.lastname.value,
                    'email': data.email.value,
                    'data_nascimento': (data.date_of_birth ? data.date_of_birth.value : null),
                    'numero_telefone': (data.phone ? data.phone.value : null),
                    'numero_mecanografico': (data.no_mecanografico ? data.no_mecanografico.value : null),
                    'bilhetes_disponiveis_barquense': data.bilhetes_disponiveis_barquense.value,
                    'bilhetes_ida_e_volta_barquense': data.bilhetes_ida_e_volta_barquense.value,
                    'bilhetes_disponiveis_transdev': data.bilhetes_disponiveis_transdev.value,
                    'bilhetes_ida_e_volta_transdev': data.bilhetes_ida_e_volta_transdev.value,
                    'nif': data.nif.value
                }
                callback({
                    'user': result
                });
            } else {
                callback({
                    'statusCode': res.statusCode,
                    'body': JSON.parse(res.body)
                })
            }
        } else {
            console.log(err);
            callback({
                'statusCode': 400,
                'body': 'erro'
            })
        }
    })
}

/*Função que confirma se já existe um cliente com aquele NIF*/
function existsClientNif(nif, callback) {
    let options = {
        url: `https://api.hubapi.com/contacts/v1/search/query?q=&property=nif&hapikey=${process.env.HUBSPOT_KEY}`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            let users = JSON.parse(res.body).contacts;
            let exists = false;
            for (let i = 0; i < users.length; i++) {
                let data = users[i].properties;

                if (nif == data.nif.value) {
                    exists = true;
                }
            }
            callback({
                'exists': exists
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            })
        }
    })
}

/*Função que cria um novo cliente */
function createClient(properties, callback) {
    let json = {
        'properties': properties
    };

    let options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        url: `https://api.hubapi.com/contacts/v1/contact/?hapikey=${process.env.HUBSPOT_KEY}`,
        body: JSON.stringify(json)
    }

    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                'statusCode': 200,
                body: {
                    'user_id': JSON.parse(res.body).vid
                }
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            })
        }
    })
}

/*Função que atualiza os dados do cliente */
function updateClient(user_id, properties, callback) {
    let json = {
        'properties': properties
    }
    let options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        url: `https://api.hubapi.com/contacts/v1/contact/vid/${user_id}/profile?hapikey=${process.env.HUBSPOT_KEY}`,
        body: JSON.stringify(json)
    }

    req.post(options, (err, res) => {
        if (!err && res.statusCode == 204) {
            callback({
                'statusCode': 200,
                'body': {
                    'message': 'Updated with sucess'
                }
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            })
        }
    })
}

module.exports = {
    getClients:getClients,
    getClient: getClient,
    existsClientNif: existsClientNif,
    createClient: createClient,
    updateClient: updateClient
};