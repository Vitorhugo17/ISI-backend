const router = require('express').Router();

const controllerExample = require('./../controllers/example.controller')

router.get('/', controllerExample.getHome);
router.get('/pass', controllerExample.comparePass);

module.exports = router;