const router = require('express').Router();

const hubspotController = require('../controllers/hubspot.controller');
const moloniController = require('../controllers/moloni.controller');

router.get('/hubspot', hubspotController.getHubspot);
//router.get('/', moloniController.getP);

router.post('/hubspot', hubspotController.updateTickets);

module.exports = router;