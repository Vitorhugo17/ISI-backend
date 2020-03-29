const hubspotController = require('./hubspot.controller');
const moloniController = require('./moloni.controller');
const jasminController = require('./jasmin.controller');

function insertPurchase(request, response) {
    const user_id = request.sanitize('user_id').escape();
    const product_id = request.sanitize('product_id').escape();
    const quantity = request.sanitize('quantity').escape();
    const status = request.sanitize('status').escape();
    const customer_name = request.sanitize('customer_name').escape();
    const company = request.sanitize('company').escape();

    hubspotController.getClient(user_id, (res) => {
        if (res.user) {
            const user = res.user;
            if (company == "Barquense") {
                moloniController.insertPurchase(user.moloni_id, product_id, quantity, status, (res) => {
                    response.status(res.statusCode).send(res.body);
                })
            } else if (company == "Transdev") {
                jasminController.insertPurchase(user.jasmin_id, customer_name, product_id, quantity, (res) => {
                    response.status(res.statusCode).send(res.body);
                })
            } else {
                response.status(400).send({
                    "message": "Company doesn't exists"
                });
            }
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
                        if (respJasmin[i].itemKey != "PORTES") {
                            let json = {};
                            json.id = respJasmin[i].itemKey;
                            json.name = respJasmin[i].description;
                            json.price = respJasmin[i].priceListLines[0].priceAmount.amount.toFixed(2);
                            json.measure = respJasmin[i].unitDescription;
                            json.company = "Transdev";
                            json.quantity = 1;
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

module.exports = {
    getProducts: getProducts,
    insertPurchase: insertPurchase
}