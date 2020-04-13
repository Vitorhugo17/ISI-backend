const router = require('express').Router();

const mainController = require('./../controllers/main.controller');

router.get("/authenticated", (request, response) => {
    response.status(200).send({
        "isAuthenticated": request.isAuthenticated()
    })
})

router.get("/stripe-key", isLoggedIn, mainController.getStripeKey);
router.get('/products', isLoggedIn, mainController.getProducts);
router.get('/profile', isLoggedIn, mainController.getInfoUser);
router.get('/tickets/unused', isLoggedIn, mainController.getUnusedTickets);
router.get('/qrcodes/:qrcode_id', isLoggedIn, mainController.readQrcode);

router.post("/pay", isLoggedIn, mainController.pay);
router.post('/purchases', isLoggedIn, mainController.insertPurchase);
router.post('/qrcodes', isLoggedIn, mainController.generateQrcode);
router.post('/qrcodes/use', isLoggedInCompany, mainController.useQrcode);

router.post('/password/recover', mainController.recoverPass);
router.put('/password/update', mainController.updatePass);

module.exports = router;