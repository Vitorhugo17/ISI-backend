const req = require('request');

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
        if (!err && res.statusCode == 200) {
            let user = JSON.parse(res.body);
            let data = user.properties;

            const result = {
                "user_id": data.hs_object_id.value,
                "moloni_id": (data.moloni_id ? data.moloni_id.value : -1),
                "jasmin_id": (data.jasmin_id ? data.jasmin_id.value : -1),
                "nome": data.firstname.value,
                "apelido": data.lastname.value,
                "email": data.email.value,
                "data_nascimento": (data.date_of_birth ? data.date_of_birth.value : null),
                "numero_telefone": (data.phone ? data.phone.value : null),
                "numero_mecanografico": (data.no_mecanografico ? data.no_mecanografico.value : null),
                "bilhetes_disponiveis_barquense": data.bilhetes_disponiveis_barquense.value,
                "bilhetes_ida_e_volta_barquense": data.bilhetes_ida_e_volta_barquense.value,
                "bilhetes_disponiveis_transdev": data.bilhetes_disponiveis_transdev.value,
                "bilhetes_ida_e_volta_transdev": data.bilhetes_ida_e_volta_transdev.value,
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
                "exists": exists
            })
        } else {
            callback({
                "statusCode": res.statusCode,
                "body": JSON.parse(res.body)
            })
        }
    })
}

/*Função que cria um novo cliente */
function createClient(properties, callback) {
    let json = {
        "properties": properties
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
                "statusCode": 200,
                body: {
                    "user_id": JSON.parse(res.body).vid
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

/*Função que atualiza os dados do cliente */
function updateClient(user_id, properties, callback) {
    let json = {
        "properties": properties
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

function shareTicket(id_user, shared_with_id, company, callback) {
    
    const post = [new Date(), hash, company];
    connect.query("SELECT * FROM users WHERE dataValidade > ? AND (dataUtilizacaoIda IS NULL OR dataUtilizacaoVolta IS NULL) AND utilizacao > 0 AND hash = ? AND empresa = ?", post, (err, rows) => {
        if (!err) {
            if (rows.length != 0) {
                let qrcode = rows[0];
                qrcode.utilizacao -= 1;

                if (qrcode.utilizacao == 0) {
                    hubspotController.getClient(qrcode.idUtilizador, (res) => {
                        if (res.user) {
                            const user = res.user;

                            let properties = {};
                            if (company == "Barquense") {
                                if (qrcode.tipo_bilhete == "normal") {
                                    properties.property = "bilhetes_disponiveis_barquense";
                                    properties.value = parseInt(user.bilhetes_disponiveis_barquense) - 1;
                                } else {
                                    properties.property = "bilhetes_ida_e_volta_barquense";
                                    properties.value = parseInt(user.bilhetes_ida_e_volta_barquense) - 1;
                                }
                            } else {
                                if (qrcode.tipo_bilhete == "normal") {
                                    properties.property = "bilhetes_disponiveis_transdev";
                                    properties.value = parseInt(user.bilhetes_disponiveis_transdev) - 1;
                                } else {
                                    properties.property = "bilhetes_ida_e_volta_transdev";
                                    properties.value = parseInt(user.bilhetes_ida_e_volta_transdev) - 1;
                                }
                            }
                            hubspotController.updateClient(qrcode.idUtilizador, [properties], (res) => {
                                if (res.statusCode == 200) {
                                    let date = new Date();
                                    let update = [qrcode.utilizacao, date, date, qrcode.idQRCode];
                                    let query = "UPDATE qrcode SET utilizacao = ?, dataUtilizacaoIda = ?, dataUtilizacaoVolta = ? WHERE idQRCode = ?";
                                    if (qrcode.tipo_bilhete != "normal") {
                                        update = [date, qrcode.idQRCode];
                                        query = "UPDATE qrcode SET utilizacao = 0 AND dataUtilizacaoVolta = ? WHERE idQRCode = ?";
                                    }
                                    connect.query(query, update, (err, rows) => {
                                        if (!err) {
                                            const foto = `${dirQrcode}/${qrcode.idUtilizador}_${qrcode.idQRCode}.png`;
                                            fs.unlink(foto, (err) => {
                                                callback({
                                                    "statusCode": 200,
                                                    body: {
                                                        "message": "Valid QRCode"
                                                    }
                                                });
                                            })
                                        } else {
                                            callback({
                                                "statusCode": 400,
                                                body: {
                                                    "message": "Invalid QRCode"
                                                }
                                            });
                                        }
                                    })
                                } else {
                                    callback({
                                        "statusCode": 400,
                                        body: {
                                            "message": "Invalid QRCode"
                                        }
                                    });
                                }
                            })
                        } else {
                            callback({
                                "statusCode": 400,
                                body: {
                                    "message": "Invalid QRCode"
                                }
                            });
                        }
                    })
                } else {
                    let date = new Date();
                    let update = [qrcode.utilizacao, date, qrcode.idQRCode];
                    connect.query("UPDATE qrcode SET utilizacao = ?, dataUtilizacaoIda = ? WHERE idQRCode = ?", update, (err, rows) => {
                        if (!err) {
                            callback({
                                "statusCode": 200,
                                body: {
                                    "message": "Valid QRCode"
                                }
                            });
                        } else {
                            callback({
                                "statusCode": 400,
                                body: {
                                    "message": "Invalid QRCode"
                                }
                            });
                        }
                    })
                }
            } else {
                callback({
                    "statusCode": 400,
                    body: {
                        "message": "Invalid QRCode"
                    }
                });
            }
        } else {
            callback({
                "statusCode": 400,
                body: {
                    "message": "Invalid QRCode"
                }
            });
        }
    })
}

module.exports = {
    getClient: getClient,
    existsClientNif: existsClientNif,
    createClient: createClient,
    updateClient: updateClient
};