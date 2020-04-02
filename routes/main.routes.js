const router = require('express').Router();

const mainController = require('./../controllers/main.controller');
const moloniController = require('./../controllers/moloni.controller');
const jasminController = require('./../controllers/jasmin.controller');
const hubspotController = require('./../controllers/hubspot.controller');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

router.get("/stripe-key", (request, response) => {
    response.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

router.post("/pay", (request, response) => {
    const paymentMethodId = request.sanitize("paymentMethodId").escape();
    const paymentIntentId = request.sanitize("paymentIntentId").escape();
    const quantity = request.sanitize("quantity").escape();
    const product_id = request.sanitize("product_id").escape();
    const company = request.sanitize("company").escape();
    const useStripeSdk = request.sanitize("useStripeSdk").escape();

    mainController.calculateOrderAmount(parseInt(quantity), product_id, company, async (res) => {
        if (res.orderAmount) {
            const orderAmount = res.orderAmount.toFixed(2);

            try {
                let intent;
                if (paymentMethodId) {
                    intent = await stripe.paymentIntents.create({
                        amount: parseInt(orderAmount*100),
                        currency: "eur",
                        payment_method: paymentMethodId,
                        confirmation_method: "manual",
                        confirm: true,
                        use_stripe_sdk: useStripeSdk,
                    });
                    // After create, if the PaymentIntent's status is succeeded, fulfill the order.
                } else if (paymentIntentId) {
                    // Confirm the PaymentIntent to finalize payment after handling a required action
                    // on the client.
                    intent = await stripe.paymentIntents.confirm(paymentIntentId);
                    // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
                }

                let status;
                switch (intent.status) {
                    case "requires_action":
                    case "requires_source_action":
                        // Card requires authentication
                        status = {
                            requiresAction: true,
                            clientSecret: intent.client_secret
                        };
                    case "requires_payment_method":
                    case "requires_source":
                        // Card was not properly authenticated, suggest a new payment method
                        status = {
                            error: "Your card was denied, please provide a new payment method"
                        };
                    case "succeeded":
                        status = {
                            clientSecret: intent.client_secret
                        };
                }
                if (status.error) {
                    response.status(400).send(status);
                } else {
                    response.status(200).send(status);
                }
            } catch (e) {
                response.status(400).send({
                    error: e.message
                });
            }
        } else {
            response.status(res.statusCode).send(res.body);
        }
    })
})

router.post('/purchases', mainController.insertPurchase);
router.post('/hubspot/:user_id', (request, response) => {
    const user_id = request.sanitize("user_id").escape();
    const data =  { "property": 'bilhetes_disponiveis_transdev', "value": 4 } ;

    hubspotController.updateClient(user_id, data, (res) => {
        response.status(res.statusCode).send(res.body);
    })
});


router.get('/products', mainController.getProducts);
router.get('/categories', (request, response) => {
    jasminController.getProducts((res) => {
        if (res.products) {
            response.status(200).send(res);
        } else
            response.status(res.statusCode).send(res.body);

    })
});

module.exports = router;