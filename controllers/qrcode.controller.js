const connect = require('./../config/connectBD');
const dirQrcode = __dirname + '/../assets/images/qrcodes';
const qrCode = require('qrcode');
const fs = require('fs');

const hubspotController = require('./hubspot.controller');

/* 
Função que regista a utilização de um QRCode 
Necessita da companhia que valida o bilhete e uma hash de verificação utilizador
*/
function useQrcode(hash, company, callback) {
    const post = [new Date(), hash, company];
    connect.query('SELECT * FROM qrcode WHERE dataValidade > ? AND (dataUtilizacaoIda IS NULL OR dataUtilizacaoVolta IS NULL) AND utilizacao > 0 AND hash = ? AND empresa = ?', post, (err, rows) => {
        if (!err) {
            if (rows.length != 0) {
                let qrcode = rows[0];
                qrcode.utilizacao -= 1;

                if ((qrcode.utilizacao == 0 && qrcode.tipo_bilhete == 'normal') || (qrcode.utilizacao == 1 && qrcode.tipo_bilhete == 'ida e volta')) {
                    hubspotController.getClient(qrcode.idUtilizador, (res) => {
                        if (res.user) {
                            const user = res.user;

                            let properties = {};
                            if (company == 'Barquense') {
                                if (qrcode.tipo_bilhete == 'normal') {
                                    properties.property = 'bilhetes_disponiveis_barquense';
                                    properties.value = parseInt(user.bilhetes_disponiveis_barquense) - 1;
                                } else {
                                    properties.property = 'bilhetes_ida_e_volta_barquense';
                                    properties.value = parseInt(user.bilhetes_ida_e_volta_barquense) - 1;
                                }
                            } else {
                                if (qrcode.tipo_bilhete == 'normal') {
                                    properties.property = 'bilhetes_disponiveis_transdev';
                                    properties.value = parseInt(user.bilhetes_disponiveis_transdev) - 1;
                                } else {
                                    properties.property = 'bilhetes_ida_e_volta_transdev';
                                    properties.value = parseInt(user.bilhetes_ida_e_volta_transdev) - 1;
                                }
                            }
                            hubspotController.updateClient(qrcode.idUtilizador, [properties], (res) => {
                                if (res.statusCode == 200) {
                                    let date = new Date();
                                    let update = [qrcode.utilizacao, date, date, qrcode.idQRCode];
                                    let query = 'UPDATE qrcode SET utilizacao = ?, dataUtilizacaoIda = ?, dataUtilizacaoVolta = ? WHERE idQRCode = ?';
                                    if (qrcode.tipo_bilhete != 'normal') {
                                        update = [qrcode.utilizacao, date, qrcode.idQRCode];
                                        query = 'UPDATE qrcode SET utilizacao = ?, dataUtilizacaoIda = ? WHERE idQRCode = ?';
                                    }
                                    connect.query(query, update, (err, rows) => {
                                        if (!err) {
                                            if (qrcode.tipo_bilhete == 'normal') {
                                                const foto = `${dirQrcode}/${qrcode.idUtilizador}_${qrcode.idQRCode}.png`;
                                                fs.unlink(foto, (err) => {
                                                    callback({
                                                        'statusCode': 200,
                                                        body: {
                                                            'message': 'Valid QRCode'
                                                        }
                                                    });
                                                })
                                            } else {
                                                callback({
                                                    'statusCode': 200,
                                                    body: {
                                                        'message': 'Valid QRCode'
                                                    }
                                                });
                                            }
                                        } else {
                                            callback({
                                                'statusCode': 400,
                                                body: {
                                                    'message': 'Invalid QRCode'
                                                }
                                            });
                                        }
                                    })
                                } else {
                                    callback({
                                        'statusCode': 400,
                                        body: {
                                            'message': 'Invalid QRCode'
                                        }
                                    });
                                }
                            })
                        } else {
                            callback({
                                'statusCode': 400,
                                body: {
                                    'message': 'Invalid QRCode'
                                }
                            });
                        }
                    })
                } else {
                    let date = new Date();
                    let update = [qrcode.utilizacao, date, qrcode.idQRCode];
                    connect.query('UPDATE qrcode SET utilizacao = ?, dataUtilizacaoVolta = ? WHERE idQRCode = ?', update, (err, rows) => {
                        if (!err) {
                            const foto = `${dirQrcode}/${qrcode.idUtilizador}_${qrcode.idQRCode}.png`;
                            fs.unlink(foto, (err) => {
                                callback({
                                    'statusCode': 200,
                                    body: {
                                        'message': 'Valid QRCode'
                                    }
                                });
                            })
                        } else {
                            callback({
                                'statusCode': 400,
                                body: {
                                    'message': 'Invalid QRCode'
                                }
                            });
                        }
                    })
                }
            } else {
                callback({
                    'statusCode': 400,
                    body: {
                        'message': 'Invalid QRCode'
                    }
                });
            }
        } else {
            callback({
                'statusCode': 400,
                body: {
                    'message': 'Invalid QRCode'
                }
            });
        }
    })
}

/* 
Função que permite ler a imagem do QRCode 
Necessita da id do utilizador e do id do QRCode
Retorna a imagem do QRCode
*/
function readQrcode(user_id, qrcode_id, callback) {
    const post = [new Date(), qrcode_id, user_id];
    connect.query('SELECT * FROM qrcode WHERE dataValidade > ? AND (dataUtilizacaoIda IS NULL OR dataUtilizacaoVolta IS NULL) AND utilizacao > 0 AND idQRCode=? AND idUtilizador = ?', post, (err, rows) => {
        if (!err) {
            if (rows.length != 0) {
                const foto = `${dirQrcode}/${user_id}_${qrcode_id}.png`;
                fs.readFile(foto, 'base64', function (err, data) {
                    if (!err) {
                        callback({
                            'statusCode': 200,
                            body: {
                                'data': `data:image/png;base64,${data}`
                            }
                        });
                    } else {
                        callback({
                            'statusCode': 404,
                            body: {
                                'message': 'QRCode not found'
                            }
                        });
                    }
                })
            } else {
                callback({
                    'statusCode': 404,
                    body: {
                        'message': 'QRCode not found'
                    }
                });
            }
        } else {
            callback({
                'statusCode': 404,
                body: {
                    'message': 'QRCode not found'
                }
            });
        }
    })
}

/* 
Função que gera um QRCode 
Necessita da companhia a que pertence o bilhete, a quantidade de vezes que pode ser utilizado o bilhete e
o id do utilizador
Retorna o id do QRCode
*/
function generateQrcode(user_id, company, utilization, callback) {
    let creation_date = new Date();
    let validation_date = new Date();

    if (utilization > 1) {
        validation_date.setHours(validation_date.getHours() + 24); //validade de 24 horas - porque é de ida e volta
    } else {
        validation_date.setMinutes(validation_date.getMinutes() + 10); //validade de 10 minutos
    }

    let hash = generateHash();
    const post = {
        dataCriacao: creation_date,
        idUtilizador: user_id,
        empresa: company,
        dataValidade: validation_date,
        utilizacao: utilization,
        hash: hash,
        dataUtilizacaoIda: null,
        dataUtilizacaoVolta: null
    }

    if (utilization == 2) {
        post.tipo_bilhete = 'ida e volta';
    } else {
        post.tipo_bilhete = 'normal';
    }
    connect.query('INSERT INTO qrcode SET ?', post, (err, rows) => {
        if (!err) {
            const qrcode_id = rows.insertId;
            const data = {
                qrcode_id: hash
            }
            qrCode.toDataURL(JSON.stringify(data), (err, image) => {
                if (!err) {
                    const imageData = image.replace(/^data:image\/png;base64,/, '');
                    const foto = `${dirQrcode}/${user_id}_${qrcode_id}.png`;

                    fs.writeFile(foto, imageData, 'base64', function (err) {
                        if (!err) {
                            callback({
                                'statusCode': 200,
                                body: {
                                    'qrcode_id': `${qrcode_id}`
                                }
                            });
                        } else {
                            callback({
                                'statusCode': 400,
                                body: {
                                    'message': "Couldn't generate qrcode",
                                    'err': err
                                }
                            });
                        }
                    })
                } else {
                    callback({
                        'statusCode': 400,
                        body: {
                            'message': "Couldn't generate qrcode"
                        }
                    });
                }
            })
        } else {
            callback({
                'statusCode': 400,
                body: {
                    'message': "Couldn't generate qrcode"
                }
            });
        }
    })
}

/* 
Função que permite gerar uma hash para mascarar o id do qrcode
Retorna a hash
*/
function generateHash() {
    const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 100;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return result;
}

module.exports = {
    generateQrcode: generateQrcode,
    readQrcode: readQrcode,
    useQrcode: useQrcode
}