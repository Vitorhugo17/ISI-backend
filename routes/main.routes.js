const router = require('express').Router();

const mainController = require('./../controllers/main.controller');

const exampleController = require('./../controllers/example.controller');

router.post('/payment', exampleController.paymentIntent);
router.post('/webhook', exampleController.webhook);



router.get("/authenticated", (request, response) => {
    if (request.isAuthenticated()) {
        response.status(200).send({
            "isAuthenticated": request.isAuthenticated(),
            "isEmpresa": request.user.isEmpresa
        })
    } else{
        response.status(200).send({
            "isAuthenticated": request.isAuthenticated()
        })
    }
    
})

router.get("/stripe-key", isLoggedIn, mainController.getStripeKey);
router.post("/pay", isLoggedIn, mainController.pay);

router.get('/products', isLoggedIn, mainController.getProducts);

router.post('/purchases', isLoggedIn, mainController.insertPurchase);

router.get('/profile', isLoggedIn, mainController.getInfoUser);
router.post('/profile/edit', isLoggedIn, mainController.editUser);

router.get('/tickets/unused', isLoggedIn, mainController.getUnusedTickets);
router.post('/tickets/share', isLoggedIn, mainController.shareTicket);

router.get('/qrcodes/:qrcode_id', isLoggedIn, mainController.readQrcode);
router.post('/qrcodes', isLoggedIn, mainController.generateQrcode);
router.post('/qrcodes/use', isLoggedInCompany, mainController.useQrcode);

router.post('/password/recover', mainController.recoverPass);
router.put('/password/update', mainController.updatePass);

module.exports = router;