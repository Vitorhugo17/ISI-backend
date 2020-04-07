const req = require('request');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bCrypt = require('bcryptjs');
const connect = require('./../config/connectBD');
const connection = require('./../config/connection');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const hubspotController = require('./hubspot.controller');
const moloniController = require('./moloni.controller');
const jasminController = require('./jasmin.controller');

function updatePass(request, response) {
    let user_id = "";
    if (request.isAuthenticated()) {
        user_id = request.user.user_id;
    } else {
        user_id = request.sanitize('user_id').escape();
    }
    const password = bCrypt.hashSync(request.sanitize('password').escape(), bCrypt.genSaltSync(10));
    const update = [password, user_id];
    connect.query('UPDATE utilizador SET password=? WHERE idUtilizador=?', update, (err, rows, fields) => {
        if (!err) {
            response.status(200).send({
                "message": "password updated with success"
            })
        } else {
            response.status(400).send({
                "message": "Can't update password"
            });
        }
    })
}

function recoverPass(request, response) {
    const email = request.sanitize('email').escape();
    connect.query(`SELECT * FROM utilizador WHERE email="${email}"`, (err, rows, fields) => {
        if (!err && rows.length != 0) {
            hubspotController.getClient(rows[0].idUtilizador, (res) => {
                if (res.user) {
                    const url = urlFront + "/recoverPass/" + res.user.user_id;
                    let bodycontent = `Olá ${res.user.nome} ${res.user.apelido}, <br> <br>
                                       Acabámos de receber um pedido para recuperar a sua conta. <br>
                                       Se pretende avançar com o pedido clique no botão em baixo para definir uma nova palavra-passe. <br><br>
                                       <center><a href="${url}"><button type="button">Recuperar Conta</button></a></center><br><br>
                                       Se não conseguir clicar no botão utilize o seguinte link: ${url}<br><br>
                                       Obrigado, <br>
                                       Equipa ISICampus`;
                    const transporter = nodemailer.createTransport(smtpTransport({
                        service: 'Gmail',
                        auth: {
                            user: connection.email.username,
                            pass: connection.email.password
                        }
                    }));
                    transporter.verify(function (error, success) {
                        if (error) {
                            console.log(error);
                            response.status(400).send("Can't send email");
                        } else {
                            const mailOptions = {
                                FROM: connection.email.username,
                                to: email,
                                subject: 'ISICampus: Recuperar conta',
                                html: bodycontent
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                    response.status(400).send("Can't send email");
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

}

function insertUser(request, response) {
    const nome = request.sanitize('nome').escape();
    const apelido = request.sanitize('apelido').escape();
    const email = request.sanitize('email').escape();
    const nif = request.sanitize('nif').escape();
    const pass = bCrypt.hashSync(request.sanitize('password').escape(), bCrypt.genSaltSync(10));

    connect.query(`SELECT* FROM utilizador WHERE email="${email}"`, (err, rows, fields) => {
        if (!err && rows.length == 0) {
            const properties = [{
                property: "firstname",
                value: nome
            }, {
                property: "lastname",
                value: apelido
            }, {
                property: "email",
                value: email
            }, {
                property: "bilhetes_disponiveis_barquense",
                value: 0
            }, {
                property: "bilhetes_ida_e_volta_barquense",
                value: 0
            }, {
                property: "bilhetes_disponiveis_transdev",
                value: 0
            }, {
                property: "bilhetes_ida_e_volta_transdev",
                value: 0
            }];
            if (nif != "") {
                properties.push({
                    property: "nif",
                    value: nif
                })
            }

            hubspotController.createClient(properties, (res) => {
                if (res.statusCode == 200) {
                    const post = {
                        idUtilizador: res.body.user_id,
                        email: email,
                        password: pass,
                        isEmpresa: false
                    }

                    connect.query('INSERT INTO utilizador SET ?', post, (err, rows, fields) => {
                        if (!err) {
                            response.status(200).send({
                                "message": "User inserted with success"
                            });
                        } else {
                            response.status(400).send({
                                "message": err.code
                            })
                        }
                    })
                } else {
                    response.status(res.statusCode).send(res.body);
                }
            });
        } else if (rows.length != 0) {
            response.status(409).send({
                "error": "CONTACT_EXISTS"
            })
        } else {
            response.status(400).send({
                "message": err.code
            })
        }
    });

}




function insertPurchase(request, response) {
    const user_id = request.user.user_id;
    const product_id = request.sanitize('product_id').escape();
    const quantity = request.sanitize('quantity').escape();
    const company = request.sanitize('company').escape();

    hubspotController.getClient(user_id, (res) => {
        if (res.user) {
            const user = res.user;
            let options = {
                url: `${global.urlBase}/products`
            };
            req.get(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    const products = JSON.parse(res.body).products;
                    let product = "";
                    for (let i = 0; i < products.length; i++) {
                        if (products[i].id == product_id) {
                            product = products[i];
                        }
                    }

                    if (product != "") {
                        const transdev_ticket = user.bilhetes_disponiveis_transdev;
                        const barquense_ticket = user.bilhetes_disponiveis_barquense;
                        const transdev_ida_volta = user.bilhetes_ida_e_volta_transdev;
                        const barquense_ida_volta = user.bilhetes_ida_e_volta_barquense;
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
                                                    let total = parseInt(barquense_ticket) + parseInt(quantity * product.quantity);
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
                                            let total = parseInt(barquense_ticket) + parseInt(quantity * product.quantity);
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
                                                    let total = parseInt(transdev_ticket) + parseInt(quantity * product.quantity);
                                                    updatedData = [{
                                                        "property": 'bilhetes_ida_e_volta_transdev',
                                                        "value": total
                                                    }, {
                                                        "property": 'jasmin_id',
                                                        "value": jasmin_id
                                                    }];
                                                } else {
                                                    let total = parseInt(barquense_ticket) + parseInt(quantity * product.quantity);
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
                                            let total = parseInt(transdev_ticket) + parseInt(quantity * product.quantity);
                                            updatedData = [{
                                                "property": 'bilhetes_ida_e_volta_transdev',
                                                "value": total
                                            }];
                                        } else {
                                            let total = parseInt(barquense_ticket) + parseInt(quantity * product.quantity);
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
                response.status(200).send({
                    "products": products
                });
            } else {
                response.status(404).send({
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
                let amount = 0;
                const products = res.products;
                for (let i = 0; i < products.length; i++) {
                    if (products[i].product_id == product_id) {
                        amount = (products[i].price + products[i].taxes[0].value).toFixed(2) * quantity;
                    }
                }
                if (amount != 0) {
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
                let amount = 0;
                const products = res.products;
                for (let i = 0; i < products.length; i++) {
                    if (products[i].itemKey == product_id) {
                        amount = products[i].priceListLines[0].priceAmount.amount.toFixed(2) * quantity;
                    }
                }
                if (amount != 0) {
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

module.exports = {
    getProducts: getProducts,
    insertPurchase: insertPurchase,
    insertUser: insertUser,
    getStripeKey: getStripeKey,
    pay: pay,
    recoverPass: recoverPass,
    updatePass: updatePass
}