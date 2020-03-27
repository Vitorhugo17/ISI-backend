const hubspotController = require('./hubspot.controller');
const moloniController = require('./moloni.controller');
const jasminController = require('./jasmin.controller');


function getProducts(request, response) {
    moloniController.getProducts((resMoloni) => {
        if (resMoloni.products) {
            const productsBarquense = resMoloni.products;
            jasminController.getProducts((resJasmin) => {
                if (resJasmin.products) {
                    const productsTransdev = resJasmin.products;
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
    getProducts: getProducts
}