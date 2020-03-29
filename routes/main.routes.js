const router = require('express').Router();

const mainController = require('./../controllers/main.controller');
const moloniController = require('./../controllers/moloni.controller');
const jasminController = require('./../controllers/jasmin.controller');
const hubspotController = require('./../controllers/hubspot.controller');

router.post('/purchases', mainController.insertPurchase);
router.post('/hubspot/:user_id', (request, response) => {
    const user_id = request.sanitize("user_id").escape();
    const ticket_number = 3;

    hubspotController.updateTickets(user_id, ticket_number, (res) => {
        response.status(res.statusCode).send(res.body);
    })
});

router.get('/', hubspotController.getHubspot);

router.get('/products', mainController.getProducts);
router.get('/categories', (request, response) => {
    jasminController.getProducts((res) => {
        if (res.products) {
            response.status(200).send(res);
        } else
            response.status(res.statusCode).send(res.body);

    })
});



module.exports = router;