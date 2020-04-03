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


module.exports = router;