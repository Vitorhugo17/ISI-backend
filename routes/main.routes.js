const router = require('express').Router();
const { resolve } = require("path");

const mainController = require('./../controllers/main.controller');
const moloniController = require('./../controllers/moloni.controller');
const jasminController = require('./../controllers/jasmin.controller');
const hubspotController = require('./../controllers/hubspot.controller');

router.get("/stripe-key", (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
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

    mainController.calculateOrderAmount(quantity, product_id, company, async (res) => {
        if (res.orderAmount) {
            const orderAmount = res.orderAmount;

            try {
                let intent;
                if (paymentMethodId) {
                    intent = await stripe.paymentIntents.create({
                        amount: orderAmount,
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
                    "message": e.message
                });
            }
        } else {
            response.status(res.statusCode).send(res.body);
        }
    })
})


router.post('/pay', async (request, response) => {
    try {
        let intent;
        if (request.body.payment_method_id) {
            // Create the PaymentIntent
            intent = await stripe.paymentIntents.create({
                payment_method: request.body.payment_method_id,
                amount: 1099,
                currency: 'eur',
                confirmation_method: 'manual',
                confirm: true
            });
        } else if (request.body.payment_intent_id) {
            intent = await stripe.paymentIntents.confirm(
                request.body.payment_intent_id
            );
        }
        // Send the response to the client
        response.send(generateResponse(intent));
    } catch (e) {
        // Display error on client
        return response.send({
            error: e.message
        });
    }
});

const generateResponse = (intent) => {
    // Note that if your API version is before 2019-02-11, 'requires_action'
    // appears as 'requires_source_action'.
    if (
        intent.status === 'requires_action' &&
        intent.next_action.type === 'use_stripe_sdk'
    ) {
        // Tell the client to handle the action
        return {
            requires_action: true,
            payment_intent_client_secret: intent.client_secret
        };
    } else if (intent.status === 'succeeded') {
        // The payment didn’t need any additional actions and completed!
        // Handle post-payment fulfillment
        return {
            success: true
        };
    } else {
        // Invalid status
        return {
            error: 'Invalid PaymentIntent status'
        }
    }
};

router.post('/purchases', mainController.insertPurchase);
router.post('/hubspot/:user_id', (request, response) => {
    const user_id = request.sanitize("user_id").escape();
    const ticket_number = 3;

    hubspotController.updateTickets(user_id, ticket_number, (res) => {
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