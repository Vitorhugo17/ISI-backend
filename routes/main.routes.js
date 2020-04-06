const router = require('express').Router();

const mainController = require('./../controllers/main.controller');
const moloniController = require('./../controllers/moloni.controller');
const jasminController = require('./../controllers/jasmin.controller');
const hubspotController = require('./../controllers/hubspot.controller');

router.get("/stripe-key", isLoggedIn, mainController.getStripeKey);
router.get('/products', isLoggedIn, mainController.getProducts);

router.post("/pay", isLoggedIn, mainController.pay);
router.post('/purchases', isLoggedIn, mainController.insertPurchase);

module.exports = router;