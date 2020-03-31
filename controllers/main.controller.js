const hubspotController = require('./hubspot.controller');
const moloniController = require('./moloni.controller');
const jasminController = require('./jasmin.controller');
const req = require('request');

function insertPurchase(request, response) {
    const user_id = request.sanitize('user_id').escape();
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
                        if (company == "Barquense") {
                            moloniController.insertPurchase(user.moloni_id, product_id, quantity, 1, (res) => {
                                if (res.statusCode == 200) {
                                    let total = parseInt(barquense_ticket) + parseInt(quantity * product.quantity);
                                    console.log(barquense_ticket, (quantity * product.quantity), total);
                                    const updatedData = {
                                        "property": 'bilhetes_disponiveis_barquense',
                                        "value": total
                                    };
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
                        } else if (company == "Transdev") {
                            jasminController.insertPurchase(user.jasmin_id, (user.firstname + " " + user.lastname), user.nif, product_id, quantity, (res) => {
                                if (res.statusCode == 200) {
                                    let total = parseInt(transdev_ticket) + parseInt(quantity * product.quantity);
                                    console.log(transdev_ticket, (quantity * product.quantity), total);
                                    const updatedData = {
                                        "property": 'bilhetes_disponiveis_transdev',
                                        "value": total
                                    };
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
        if (resMoloni.products) {
            const respMoloni = resMoloni.products;

            let productsBarquense = [];
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
                productsBarquense.push(json);
            }

            jasminController.getProducts((resJasmin) => {
                if (resJasmin.products) {
                    const respJasmin = resJasmin.products;

                    let productsTransdev = [];
                    for (let i = 0; i < respJasmin.length; i++) {
                        if (respJasmin[i].itemTypeDescription == "Service" && respJasmin[i].itemKey != "PORTES") {
                            let json = {};
                            json.id = respJasmin[i].itemKey;
                            json.name = respJasmin[i].description;
                            json.price = respJasmin[i].priceListLines[0].priceAmount.amount.toFixed(2);
                            json.measure = respJasmin[i].unitDescription;
                            json.company = "Transdev";
                            json.quantity = parseInt(respJasmin[i].complementaryDescription);
                            productsTransdev.push(json);
                        }
                    }

                    const products = productsBarquense.concat(productsTransdev);
                    response.status(200).send({
                        "products": products
                    });
                } else {
                    response.status(resJasmin.statusCode).send(resJasmin.body);
                }
            })
        } else {
            response.status(resMoloni.statusCode).send(resMoloni.body);
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
    calculateOrderAmount: calculateOrderAmount
}