const router = require('express').Router();

const mainController = require('./../controllers/main.controller');
const paymentsController = require('./../controllers/payments.controller');

router.get('/authenticated', (request, response) => {
    if (request.isAuthenticated()) {
        response.status(200).send({
            'isAuthenticated': request.isAuthenticated(),
            'isEmpresa': request.user.isEmpresa,
            'user': request.user
        })
    } else{
        response.status(200).send({
            'isAuthenticated': request.isAuthenticated()
        })
    }
    
})
//rotas sem login
router.post('/webhook', paymentsController.webhook);

router.post('/password/recover', mainController.recoverPass);
router.put('/password/update', mainController.updatePass);

//rotas com login
router.get('/users', isLoggedIn, mainController.getUsers);

router.get('/payment/:id/status', isLoggedIn, paymentsController.paymentStatus);
router.get('/stripe-key', isLoggedIn, paymentsController.getStripeKey);
router.post('/payment', isLoggedIn, paymentsController.paymentIntent);

router.get('/products', isLoggedIn, mainController.getProducts);

router.get('/purchases', isLoggedIn, mainController.getPurchases);

router.get('/download/:company/:document_id', mainController.downloadPDF);

router.get('/profile', isLoggedIn, mainController.getInfoUser);
router.put('/profile/edit', isLoggedIn, mainController.editUser);

router.get('/tickets/unused', isLoggedIn, mainController.getUnusedTickets);
router.get('/tickets/used', isLoggedIn, mainController.getUsedTickets);
router.post('/tickets/share', isLoggedIn, mainController.shareTicket);

router.get('/qrcodes/:qrcode_id', isLoggedIn, mainController.readQrcode);
router.post('/qrcodes', isLoggedIn, mainController.generateQrcode);
router.post('/qrcodes/use', isLoggedInCompany, mainController.useQrcode);


module.exports = router;