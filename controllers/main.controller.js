const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bCrypt = require('bcryptjs');
const connect = require('./../config/connectBD');
const nodemailer = require('nodemailer');

const hubspotController = require('./hubspot.controller');
const moloniController = require('./moloni.controller');
const jasminController = require('./jasmin.controller');
const qrcodeController = require('./qrcode.controller');

function generateQrcode(request, response) {
    const user_id = request.user.user_id;
    const company = request.sanitize("company").escape();
    const product_type = request.sanitize("product_type").escape();
    let utilization = 0;

    if (product_type.includes("barquense")) {
        hubspotController.getClient(user_id, (res) => {
            if (res.user) {
                const user = res.user;

                if (product_type.toLowerCase().includes("ida_e_volta")) {
                    if (user.bilhetes_ida_e_volta_barquense > 0) {
                        utilization = 2;
                    }
                } else {
                    if (user.bilhetes_disponiveis_barquense > 0) {
                        utilization = 1;
                    }
                }
                if (utilization != 0) {
                    qrcodeController.generateQrcode(user_id, company, utilization, (res) => {
                        response.status(res.statusCode).send(res.body);
                    })
                } else {
                    response.status(400).send({
                        "message": "Couldn't generate qrcode"
                    })
                }
            } else {
                response.status(400).send({
                    "message": "Couldn't generate qrcode"
                })
            }
        })
    } else if (product_type.includes("transdev")) {
        hubspotController.getClient(user_id, (res) => {
            if (res.user) {
                const user = res.user;

                if (product_type.toLowerCase().includes("ida_e_volta")) {
                    if (user.bilhetes_ida_e_volta_transdev > 0) {
                        utilization = 2;
                    }
                } else {
                    if (user.bilhetes_disponiveis_transdev > 0) {
                        utilization = 1;
                    }
                }
                if (utilization != 0) {
                    qrcodeController.generateQrcode(user_id, company, utilization, (res) => {
                        response.status(res.statusCode).send(res.body);
                    })
                } else {
                    response.status(400).send({
                        "message": "Couldn't generate qrcode"
                    })
                }
            } else {
                response.status(400).send({
                    "message": "Couldn't generate qrcode"
                })
            }
        })
    } else {
        response.status(400).send({
            "message": "Couldn't generate qrcode"
        })
    }
}

function readQrcode(request, response) {
    const user_id = request.user.user_id;
    const qrcode_id = request.sanitize("qrcode_id").escape();

    qrcodeController.readQrcode(user_id, qrcode_id, (res) => {
        response.status(res.statusCode).send(res.body);
    })
}

function useQrcode(request, response) {
    const hash = request.sanitize("qrcode_id").escape();
    const company = request.user.nome;

    qrcodeController.useQrcode(hash, company, (res) => {
        response.status(res.statusCode).send(res.body);
    })
}

function getInfoUser(request, response) {
    const user_id = request.user.user_id;
    hubspotController.getClient(user_id, (res) => {
        if (res.user) {
            const result = {
                "nome": res.user.nome,
                "apelido": res.user.apelido,
                "email": res.user.email,
                "data_nascimento": res.user.data_nascimento,
                "numero_telefone": res.user.numero_telefone,
                "numero_mecanografico": res.user.numero_mecanografico,
                "nif": res.user.nif
            }
            response.status(200).send({
                "user": result
            })
        } else {
            response.status(400).send({
                "message": "User not found"
            });
        }
    })
}

function getUnusedTickets(request, response) {
    const user_id = request.user.user_id;
    hubspotController.getClient(user_id, (res) => {
        if (res.user) {
            const result = {
                "bilhetes_disponiveis_barquense": res.user.bilhetes_disponiveis_barquense,
                "bilhetes_ida_e_volta_barquense": res.user.bilhetes_ida_e_volta_barquense,
                "bilhetes_disponiveis_transdev": res.user.bilhetes_disponiveis_transdev,
                "bilhetes_ida_e_volta_transdev": res.user.bilhetes_ida_e_volta_transdev
            }
            response.status(200).send({
                "bilhetes": result
            })
        } else {
            response.status(400).send({
                "message": "Data not found"
            });
        }
    })
}

async function updatePass(request, response) {
    const type = request.sanitize('type').escape();
    const password = await bCrypt.hash(request.sanitize('password').escape(), await bCrypt.genSalt(10));
    if (type == 'recover') {
        let now = new Date();
        now = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const link = request.sanitize("user_id").escape();
        connect.query(`SELECT * FROM link_rec_passe WHERE validade>"${now}" AND link="${link}"`, (err, rows, fields) => {
            if (!err && rows.length != 0) {
                let user_id = rows[0].idUtilizador;
                const update = [password, user_id];
                connect.query('UPDATE utilizador SET password=? WHERE idUtilizador=?', update, (err, rows, fields) => {
                    if (!err) {
                        const post = [user_id, link];
                        connect.query('DELETE FROM link_rec_passe WHERE idUtilizador=? AND link=?', post, (err, rows, fields) => {
                            if (!err) {
                                response.status(200).send({
                                    "message": "Password updated with success"
                                })
                            } else {
                                response.status(200).send({
                                    "message": "Password updated with success"
                                })

                            }
                        })
                    } else {
                        response.status(400).send({
                            "message": "Can't update password"
                        })
                    }
                })
            } else {
                response.status(400).send({
                    "message": "Can't update password"
                })
            }
        })
    } else if (request.isAuthenticated()) {
        const update = [password, request.user.user_id];
        connect.query('UPDATE utilizador SET password=? WHERE idUtilizador=?', update, (err, rows, fields) => {
            if (!err) {
                response.status(200).send({
                    "message": "Password updated with success"
                })
            } else {
                response.status(400).send({
                    "message": "Can't update password"
                })
            }
        })
    } else {
        response.status(403).send({
            "message": "Não está autorizado a aceder a este conteudo"
        })
    }
}

function recoverPass(request, response) {
    const email = request.sanitize('email').escape();
    connect.query(`SELECT * FROM utilizador WHERE email="${email}"`, (err, rows, fields) => {
        if (!err && rows.length != 0) {
            hubspotController.getClient(rows[0].idUtilizador, (res) => {
                if (res.user) {
                    const link = generateLink();
                    let validade = new Date();
                    validade.setMinutes(validade.getMinutes() + 15);
                    const post = {
                        idUtilizador: res.user.user_id,
                        link: link,
                        validade: validade
                    }
                    connect.query('INSERT INTO link_rec_passe SET ?', post, (err, rows, fields) => {
                        if (!err) {
                            const url = urlFront + "/recoverPass/" + link;
                            let bodycontent = `Olá ${res.user.nome} ${res.user.apelido}, <br> <br>
                                       Acabámos de receber um pedido para recuperar a sua conta. <br>
                                       Se pretende avançar com o pedido clique no botão em baixo para definir uma nova palavra-passe. <br><br>
                                       <center><a href="${url}"><button type="button">Recuperar Conta</button></a></center><br><br>
                                       Se não conseguir clicar no botão utilize o seguinte link: ${url}<br><br>
                                       Obrigado, <br>
                                       Equipa ISICampus`;
                            const transporter = nodemailer.createTransport({
                                host: 'smtp.gmail.com',
                                port: 465,
                                secure: true,
                                auth: {
                                    user: process.env.EMAIL_USERNAME,
                                    pass: process.env.EMAIL_PASSWORD
                                },
                                tls: {
                                    // do not fail on invalid certs
                                    rejectUnauthorized: false
                                }
                            });
                            transporter.verify(function (error, success) {
                                if (error) {
                                    response.status(400).send({
                                        "message": "Can't send email",
                                        "error": error
                                    });
                                } else {
                                    const mailOptions = {
                                        "from": {
                                            "name": 'ISITravel',
                                            "address": process.env.EMAIL_USERNAME
                                        },
                                        "to": {
                                            "name": `${res.user.nome} ${res.user.apelido}`,
                                            "address": email
                                        },
                                        "subject": 'ISICampus: Recuperar conta',
                                        "html": bodycontent
                                    };
                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            response.status(400).send({
                                                "message": "Can't send email",
                                                "error": error
                                            });
                                        } else {
                                            response.status(200).send({
                                                "message": "mail sent"
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            response.status(400).send({
                                "message": "User not found"
                            });
                        }
                    })
                } else {
                    response.status(400).send({
                        "message": "User not found"
                    });
                }
            })
        } else {
            response.status(400).send({
                "message": "User not found"
            });
        }
    })

}

function shareTicket(shared_with_id, company, callback) {
    const user_id = request.user.user_id;
    const shared_with_id = shared_with_id;
    const company = company;

    hubspotController.getClient(user_id, (res) => {
        if (res.user) {
            const user_id = res.user.user_id;
            let transdev_tickets = res.user.bilhetes_disponiveis_transdev;
            let barquense_tickets = res.user.bilhetes_disponiveis_barquense;

            if (company == "transdev" && transdev_tickets != 0) {
                updatedData = [{
                    "property": 'bilhetes_disponiveis_transdev',
                    "value": transdev_tickets - 1
                }];

                hubspotController.updateClient(user_id, updatedData, (res) => {
                    if (res.statusCode == 200) {
                        hubspotController.getClient(shared_with_id, (res) => {
                            if (res.user) {
                                const shared_with = user_id;
                                const shared_with_transdev_tickets = res.user.bilhetes_disponiveis_transdev;
                                updatedData = [{
                                    "property": 'bilhetes_disponiveis_transdev',
                                    "value": shared_with_transdev_tickets + 1
                                }];
                                hubspotController.updateClient(shared_with, updatedData, (res) => {
                                    if (res.statusCode == 200) {
                                        const post = {
                                            idUtilizadorEnviou: user_id,
                                            idUtilizadorEnviou: shared_with,
                                            dataPartilha: newDate(),
                                            tipo_bilhete: "único",
                                            empresa: "transdev"
                                        }

                                        connect.query('INSERT INTO partilha_bilhete SET ?', post, (err, rows, fields) => {
                                            if (!err) {
                                                done(null, {
                                                    "statusCode": 200,
                                                    "body": {
                                                        "message": "Shared with success"
                                                    }
                                                });
                                            } else {
                                                done(null, {
                                                    "statusCode": 400,
                                                    "body": {
                                                        "message": "Ticket not shared"
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        done(null, res);
                                    }
                                })
                            } else {
                                callback({
                                    "statusCode": 400,
                                    body: {
                                        "message": "Ticket not shared"
                                    }
                                });
                            }
                        })
                    } else {
                        callback({
                            "statusCode": 400,
                            body: {
                                "message": "Ticket not shared"
                            }
                        });
                    }
                })

            } else if (company == "barquense" && barquense_tickets != 0) {
                updatedData = [{
                    "property": 'bilhetes_disponiveis_barquense',
                    "value": barquense_tickets - 1
                }];

                hubspotController.updateClient(user_id, updatedData, (res) => {
                    if (res.statusCode == 200) {
                        hubspotController.getClient(shared_with_id, (res) => {
                            if (res.user) {
                                const shared_with = res.user.user_id;
                                const shared_with_barquense_tickets = res.user.bilhetes_disponiveis_barquense;
                                updatedData = [{
                                    "property": 'bilhetes_disponiveis_transdev',
                                    "value": shared_with_barquense_tickets + 1
                                }];
                                hubspotController.updateClient(shared_with, updatedData, (res) => {
                                    const post = {
                                        idUtilizadorEnviou: user_id,
                                        idUtilizadorEnviou: shared_with,
                                        dataPartilha: newDate(),
                                        tipo_bilhete: "único",
                                        empresa: "barquense"
                                    }

                                    connect.query('INSERT INTO partilha_bilhete SET ?', post, (err, rows, fields) => {
                                        if (!err) {
                                            done(null, {
                                                "statusCode": 200,
                                                "body": {
                                                    "message": "Shared with success"
                                                }
                                            });
                                        } else {
                                            done(null, {
                                                "statusCode": 400,
                                                "body": {
                                                    "message": "Ticket not shared"
                                                }
                                            })
                                        }
                                    })
                                })
                            } else {
                                callback({
                                    "statusCode": 400,
                                    body: {
                                        "message": "Ticket not shared"
                                    }
                                });
                            }
                        })
                    } else {
                        callback({
                            "statusCode": 400,
                            body: {
                                "message": "Ticket not shared"
                            }
                        });
                    }

                })

            } else {
                callback({
                    "statusCode": 400,
                    body: {
                        "message": "No tickets available"
                    }
                });
            }
        } else {
            callback({
                "statusCode": 400,
                body: {
                    "message": "Couldn't get the client"
                }
            });
        }
    })
}

function insertPurchase(request, response) {
    const user_id = request.user.user_id;
    const product_id = request.sanitize('product_id').escape();
    const quantity = request.sanitize('quantity').escape();
    const company = request.sanitize('company').escape();

    hubspotController.getClient(user_id, (res) => {
        if (res.user) {
            const user = res.user;
            getProductsOrganized((res) => {
                if (res.products) {
                    const products = res.products;
                    let product = "";
                    for (let i = 0; i < products.length; i++) {
                        if (products[i].id == product_id) {
                            product = products[i];
                        }
                    }

                    if (product != "") {
                        const transdev_ticket = user.bilhetes_disponiveis_transdev;
                        const barquense_ticket = user.bilhetes_disponiveis_barquense;
                        const bilhetes_ida_e_volta_transdev = user.bilhetes_ida_e_volta_transdev;
                        const bilhetes_ida_e_volta_barquense = user.bilhetes_ida_e_volta_barquense;
                        if (company == "Barquense") {
                            let moloni_id = user.moloni_id;

                            if (moloni_id == -1) {
                                moloniController.insertClient(user.nif, (user.nome + " " + user.apelido), user.email, (res) => {
                                    if (res.statusCode == 200) {
                                        moloni_id = res.body.customer_id;

                                        moloniController.insertPurchase(moloni_id, product_id, parseInt(quantity), 1, (res) => {
                                            if (res.statusCode == 200) {
                                                let updatedData = {};
                                                if (product.name.toLowerCase().includes("ida e volta")) {
                                                    let total = parseInt(bilhetes_ida_e_volta_barquense) + parseInt(quantity * product.quantity);
                                                    updatedData = [{
                                                        "property": 'bilhetes_ida_e_volta_barquense',
                                                        "value": total
                                                    }, {
                                                        "property": 'moloni_id',
                                                        "value": moloni_id
                                                    }];
                                                } else {
                                                    let total = parseInt(barquense_ticket) + parseInt(quantity * product.quantity);
                                                    updatedData = [{
                                                        "property": 'bilhetes_disponiveis_barquense',
                                                        "value": total
                                                    }, {
                                                        "property": 'moloni_id',
                                                        "value": moloni_id
                                                    }];
                                                }
                                                hubspotController.updateClient(user_id, updatedData, (res) => {
                                                    if (res.statusCode == 200) {
                                                        response.status(200).send({
                                                            "message": "Purchase inserted with success"
                                                        })
                                                    } else {
                                                        response.status(res.statusCode).send(res.body);
                                                    }
                                                })
                                            } else {
                                                response.status(res.statusCode).send(res.body);
                                            }
                                        })
                                    } else {
                                        response.status(res.statusCode).send(res.body);
                                    }
                                })
                            } else {
                                moloniController.insertPurchase(moloni_id, product_id, parseInt(quantity), 1, (res) => {
                                    if (res.statusCode == 200) {
                                        let updatedData = {};
                                        if (product.name.toLowerCase().includes("ida e volta")) {
                                            let total = parseInt(bilhetes_ida_e_volta_barquense) + parseInt(quantity * product.quantity);
                                            updatedData = [{
                                                "property": 'bilhetes_ida_e_volta_barquense',
                                                "value": total
                                            }];
                                        } else {
                                            let total = parseInt(barquense_ticket) + parseInt(quantity * product.quantity);
                                            updatedData = [{
                                                "property": 'bilhetes_disponiveis_barquense',
                                                "value": total
                                            }];
                                        }
                                        hubspotController.updateClient(user_id, updatedData, (res) => {
                                            if (res.statusCode == 200) {
                                                response.status(200).send({
                                                    "message": "Purchase inserted with success"
                                                })
                                            } else {
                                                response.status(res.statusCode).send(res.body);
                                            }
                                        })
                                    } else {
                                        response.status(res.statusCode).send(res.body);
                                    }
                                })
                            }
                        } else if (company == "Transdev") {
                            let jasmin_id = user.jasmin_id;
                            if (jasmin_id == -1) {
                                jasminController.insertClient((user.nome + " " + user.apelido), (res) => {
                                    if (res.statusCode == 200) {
                                        jasmin_id = res.body.customer_id;

                                        jasminController.insertPurchase(jasmin_id, (user.firstname + " " + user.lastname), user.nif, product_id, parseInt(quantity), (res) => {
                                            if (res.statusCode == 200) {
                                                if (product.name.toLowerCase().includes("ida e volta")) {
                                                    let total = parseInt(bilhetes_ida_e_volta_transdev) + parseInt(quantity * product.quantity);
                                                    updatedData = [{
                                                        "property": 'bilhetes_ida_e_volta_transdev',
                                                        "value": total
                                                    }, {
                                                        "property": 'jasmin_id',
                                                        "value": jasmin_id
                                                    }];
                                                } else {
                                                    let total = parseInt(transdev_ticket) + parseInt(quantity * product.quantity);
                                                    updatedData = [{
                                                        "property": 'bilhetes_disponiveis_transdev',
                                                        "value": total
                                                    }, {
                                                        "property": 'jasmin_id',
                                                        "value": jasmin_id
                                                    }];
                                                }
                                                hubspotController.updateClient(user_id, updatedData, (res) => {
                                                    if (res.statusCode == 200) {
                                                        response.status(200).send({
                                                            "message": "Purchase inserted with success"
                                                        })
                                                    } else {
                                                        response.status(res.statusCode).send(res.body);
                                                    }
                                                })
                                            } else {
                                                response.status(res.statusCode).send(res.body);
                                            }
                                        })
                                    }
                                })
                            } else {
                                jasminController.insertPurchase(jasmin_id, (user.firstname + " " + user.lastname), user.nif, product_id, parseInt(quantity), (res) => {
                                    if (res.statusCode == 200) {
                                        if (product.name.toLowerCase().includes("ida e volta")) {
                                            let total = parseInt(bilhetes_ida_e_volta_transdev) + parseInt(quantity * product.quantity);
                                            updatedData = [{
                                                "property": 'bilhetes_ida_e_volta_transdev',
                                                "value": total
                                            }];
                                        } else {
                                            let total = parseInt(transdev_ticket) + parseInt(quantity * product.quantity);
                                            updatedData = [{
                                                "property": 'bilhetes_disponiveis_transdev',
                                                "value": total
                                            }];
                                        }
                                        hubspotController.updateClient(user_id, updatedData, (res) => {
                                            if (res.statusCode == 200) {
                                                response.status(200).send({
                                                    "message": "Purchase inserted with success"
                                                })
                                            } else {
                                                response.status(res.statusCode).send(res.body);
                                            }
                                        })
                                    } else {
                                        response.status(res.statusCode).send(res.body);
                                    }
                                })
                            }
                        } else {
                            response.status(400).send({
                                "message": "Company doesn't exists"
                            });
                        }
                    } else {
                        response.status(400).send({
                            "message": "Product doesn't exists"
                        });
                    }
                } else {
                    response.status(res.statusCode).send(res.body);
                }
            })
        } else {
            response.status(res.statusCode).send(res.body);
        }
    })
}

function getProducts(request, response) {
    getProductsOrganized((res) => {
        if (res.products) {
            response.status(200).send({
                "products": res.products
            })
        } else {
            response.status(res.statusCode).send(res.body);
        }
    })
}

function getProductsOrganized(callback) {
    moloniController.getProducts((resMoloni) => {
        jasminController.getProducts((resJasmin) => {
            let products = [];
            if (resMoloni.products) {
                const respMoloni = resMoloni.products;

                for (let i = 0; i < respMoloni.length; i++) {
                    let json = {};
                    json.id = respMoloni[i].product_id;
                    json.name = respMoloni[i].name;
                    json.price = (respMoloni[i].price + respMoloni[i].taxes[0].value).toFixed(2);
                    json.measure = respMoloni[i].measurement_unit.name;
                    json.company = "Barquense";
                    if (respMoloni[i].child_products[0]) {
                        json.quantity = respMoloni[i].child_products[0].qty;
                    } else {
                        json.quantity = 1;
                    }
                    products.push(json);
                }
            }
            if (resJasmin.products) {
                const respJasmin = resJasmin.products;

                for (let i = 0; i < respJasmin.length; i++) {
                    if (respJasmin[i].itemTypeDescription == "Service" && respJasmin[i].itemKey != "PORTES") {
                        let json = {};
                        json.id = respJasmin[i].itemKey;
                        json.name = respJasmin[i].description;
                        json.price = respJasmin[i].priceListLines[0].priceAmount.amount.toFixed(2);
                        json.measure = respJasmin[i].unitDescription;
                        json.company = "Transdev";
                        json.quantity = parseInt(respJasmin[i].complementaryDescription);
                        products.push(json);
                    }
                }
            }

            if (products.length != 0) {
                callback({
                    "products": products
                });
            } else {
                callback({
                    "statusCode": 404,
                    "message": "Products not found"
                })
            }
        })
    })
}

function getStripeKey(request, response) {
    response.status(200).send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
}

function pay(request, response) {
    const paymentMethodId = request.sanitize("paymentMethodId").escape();
    const paymentIntentId = request.sanitize("paymentIntentId").escape();
    const quantity = request.sanitize("quantity").escape();
    const product_id = request.sanitize("product_id").escape();
    const company = request.sanitize("company").escape();
    const useStripeSdk = request.sanitize("useStripeSdk").escape();

    calculateOrderAmount(parseInt(quantity), product_id, company, async (res) => {
        if (res.orderAmount) {
            const orderAmount = res.orderAmount.toFixed(2);

            try {
                let intent;
                if (paymentMethodId) {
                    intent = await stripe.paymentIntents.create({
                        amount: parseInt(orderAmount * 100),
                        currency: "eur",
                        payment_method: paymentMethodId,
                        confirmation_method: "manual",
                        confirm: true,
                        use_stripe_sdk: useStripeSdk
                    });
                    // After create, if the PaymentIntent's status is succeeded, fulfill the order.
                } else if (paymentIntentId) {
                    // Confirm the PaymentIntent to finalize payment after handling a required action
                    // on the client.
                    intent = await stripe.paymentIntents.confirm(paymentIntentId);
                    // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
                }

                let status;
                switch (intent.status) {
                    case "requires_action":
                    case "requires_source_action":
                        // Card requires authentication
                        status = {
                            requiresAction: true,
                            clientSecret: intent.client_secret
                        };
                    case "requires_payment_method":
                    case "requires_source":
                        // Card was not properly authenticated, suggest a new payment method
                        status = {
                            error: "Your card was denied, please provide a new payment method"
                        };
                    case "succeeded":
                        status = {
                            clientSecret: intent.client_secret
                        };
                }
                if (status.error) {
                    response.status(400).send(status);
                } else {
                    response.status(200).send(status);
                }
            } catch (e) {
                response.status(400).send({
                    error: e.message
                });
            }
        } else {
            response.status(res.statusCode).send(res.body);
        }
    })
}

function calculateOrderAmount(quantity, product_id, company, callback) {
    if (company == "Barquense") {
        moloniController.getProducts((res) => {
            if (res.products) {
                const products = res.products;

                let productsF = [];
                for (let i = 0; i < products.length; i++) {
                    if (quantity >= 5) {
                        if (quantity % 5 != 0) {
                            if (products[i].product_id == product_id) {
                                productsF.push({
                                    "qty": (quantity % 5),
                                    "price": products[i].price,
                                    "taxes": products[i].taxes[0].value
                                });
                            }
                        }
                        if (products[i].name.includes("Pack")) {
                            productsF.push({
                                "qty": Math.floor(quantity / 5),
                                "price": products[i].price,
                                "taxes": products[i].taxes[0].value
                            });
                        }
                    } else {
                        if (products[i].product_id == product_id) {
                            productsF.push({
                                "qty": quantity,
                                "price": products[i].price,
                                "taxes": products[i].taxes[0].value
                            });
                            break;
                        }
                    }
                }
                if (productsF.length != 0) {
                    let amount = 0;
                    for (let i = 0; i < productsF.length; i++) {
                        amount += (productsF[i].qty * (productsF[i].price + products[i].taxes[0].value)).toFixed(2);
                    }
                    callback({
                        "orderAmount": amount
                    })
                } else {
                    callback({
                        "statusCode": 404,
                        "body": {
                            "message": "Product not found"
                        }
                    });
                }
            } else {
                callback({
                    "statusCode": res.statusCode,
                    "body": res.body
                });
            }
        })
    } else if (company == "Transdev") {
        jasminController.getProducts((res) => {
            if (res.products) {
                const products = res.products;

                let productsF = [];
                for (let i = 0; i < products.length; i++) {
                    if (quantity >= 10) {
                        if (quantity % 10 != 0) {
                            if (products[i].itemKey == parseInt(product_id)) {
                                productsF.push({
                                    "quantity": (quantity % 10),
                                    "unitPrice": products[i].priceListLines[0].priceAmount
                                });
                            }
                        }
                        if (products[i].description.includes("Pack")) {
                            productsF.push({
                                "quantity": Math.floor(quantity / 10),
                                "unitPrice": products[i].priceListLines[0].priceAmount
                            });
                        }
                    } else {
                        if (products[i].itemKey == parseInt(product_id)) {
                            productsF.push({
                                "quantity": quantity,
                                "unitPrice": products[i].priceListLines[0].priceAmount
                            });
                            break;
                        }
                    }
                }
                if (productsF.length != 0) {
                    let amount = 0;
                    for (let i = 0; i < productsF.length; i++) {
                        amount += (productsF[i].quantity * productsF[i].unitPrice).toFixed(2);
                    }
                    callback({
                        "orderAmount": amount
                    })
                } else {
                    callback({
                        "statusCode": 404,
                        "body": {
                            "message": "Product not found"
                        }
                    });
                }
            } else {
                callback({
                    "statusCode": res.statusCode,
                    "body": res.body
                });
            }
        })
    }
}

function generateLink() {
    const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const length = 25;
    let result = "";
    for (let i = 0; i < length; i++) {
        result += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return result;
}

module.exports = {
    generateQrcode: generateQrcode,
    readQrcode: readQrcode,
    useQrcode: useQrcode,
    getProducts: getProducts,
    insertPurchase: insertPurchase,
    getStripeKey: getStripeKey,
    pay: pay,
    recoverPass: recoverPass,
    updatePass: updatePass,
    getInfoUser: getInfoUser,
    getUnusedTickets: getUnusedTickets,
    shareTicket: shareTicket
}