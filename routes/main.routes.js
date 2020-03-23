const router = require('express').Router();

const purchaseController = require('../controllers/purchase.controller');
const moloniController = require('../controllers/moloni.controller');

router.get('/purchases', purchaseController.getPurchase);
router.get('/', moloniController.getP);

module.exports = router;