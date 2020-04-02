const router = require('express').Router();

const mainController = require('./../controllers/main.controller');
const moloniController = require('./../controllers/moloni.controller');
const jasminController = require('./../controllers/jasmin.controller');
const hubspotController = require('./../controllers/hubspot.controller');

router.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get("/stripe-key", mainController.getStripeKey);
router.get('/products', mainController.getProducts);

router.post("/pay", mainController.pay);
router.post('/purchases', mainController.insertPurchase);
router.post('/users', mainController.insertUser);

router.post('/moloni', (request, response) => {
    const nome = request.body.nome;
    const nif = request.body.nif;
    const email = request.body.email;
    moloniController.insertClient(nif, nome, email, (res) => {
        response.status(res.statusCode).send(res.body);
    })
})

module.exports = router;