const router = require('express').Router();

const purchaseController = require('../controllers/purchase.controller')

router.get('/purchases', purchaseController.getPurchase);

module.exports = router;