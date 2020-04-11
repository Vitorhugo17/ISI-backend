const router = require('express').Router();

const mainController = require('./../controllers/main.controller');
const moloniController = require('./../controllers/moloni.controller');
const jasminController = require('./../controllers/jasmin.controller');
const hubspotController = require('./../controllers/hubspot.controller');

router.get("/stripe-key", isLoggedIn, mainController.getStripeKey);
router.get('/products', isLoggedIn, mainController.getProducts);
router.get('/profile', isLoggedIn, mainController.getInfoUser);
router.get('/tickets/unused', isLoggedIn, mainController.getUnusedTickets);

router.post("/pay", isLoggedIn, mainController.pay);
router.post('/purchases', isLoggedIn, mainController.insertPurchase);
router.post('/password/recover', mainController.recoverPass);
router.put('/password/update', mainController.updatePass);

module.exports = router;