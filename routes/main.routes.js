const router = require('express').Router();

const mainController = require('./../controllers/main.controller');

router.get('/products', mainController.getProducts);


module.exports = router;