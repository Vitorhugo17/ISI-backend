const config = require('./../config/stripe.config');
const stripe = require('stripe')(config.stripe.secretKey);

const moloniController = require('./moloni.controller');
const jasminController = require('./jasmin.controller');

function paymentIntent(request, response) {
    const quantity = request.sanitize("quantity").escape();
    const product_id = request.sanitize("product_id").escape();
    const company = request.sanitize("company").escape();
    calculatePaymentAmount(parseInt(quantity), product_id, company, async (res) => {
        if (res.orderAmount) {
            const amount = res.orderAmount;
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount * 100,
                    currency: config.currency,
                    payment_method_types: config.paymentMethods,
                });
                return response.status(200).json({
                    paymentIntent
                });
            } catch (err) {
                return response.status(500).json({
                    error: err.message
                });
            }
        } else {
            return response.status(res.statusCode).json(res.body);
        }
    });
}

async function webhook(request, response) {
    let data;
    let eventType;
    // Check if webhook signing is configured.
    if (config.stripe.webhookSecret) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = request.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                request.rawBody,
                signature,
                config.stripe.webhookSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return response.status(400).send({
                "error": "Webhook signature verification failed."
            });
        }
        // Extract the object from the event.
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // retrieve the event data directly from the request body.
        data = request.body.data;
        eventType = request.body.type;
    }
    const object = data.object;

    // Monitor payment_intent.succeeded & payment_intent.payment_failed events.
    if (object.object === 'payment_intent') {
        const paymentIntent = object;
        if (eventType === 'payment_intent.succeeded') {
            console.log(
                `🔔  Webhook received! Payment for PaymentIntent ${paymentIntent.id} succeeded.`
            );
        } else if (eventType === 'payment_intent.payment_failed') {
            const paymentSourceOrMethod = paymentIntent.last_payment_error
                .payment_method ?
                paymentIntent.last_payment_error.payment_method :
                paymentIntent.last_payment_error.source;
            console.log(
                `🔔  Webhook received! Payment on ${paymentSourceOrMethod.object} ${paymentSourceOrMethod.id} of type ${paymentSourceOrMethod.type} for PaymentIntent ${paymentIntent.id} failed.`
            );
            // Note: you can use the existing PaymentIntent to prompt your customer to try again by attaching a newly created source:
            // https://stripe.com/docs/payments/payment-intents/usage#lifecycle
        }
    }

    // Monitor `source.chargeable` events.
    if (
        object.object === 'source' &&
        object.status === 'chargeable' &&
        object.metadata.paymentIntent
    ) {
        const source = object;
        console.log(`🔔  Webhook received! The source ${source.id} is chargeable.`);
        // Find the corresponding PaymentIntent this source is for by looking in its metadata.
        const paymentIntent = await stripe.paymentIntents.retrieve(
            source.metadata.paymentIntent
        );
        // Check whether this PaymentIntent requires a source.
        if (paymentIntent.status != 'requires_payment_method') {
            return respone.status(403).send({
                "error": 'requires_payment_method'
            });
        }
        // Confirm the PaymentIntent with the chargeable source.
        await stripe.paymentIntents.confirm(paymentIntent.id, {
            source: source.id
        });
    }

    // Monitor `source.failed` and `source.canceled` events.
    if (
        object.object === 'source' && ['failed', 'canceled'].includes(object.status) &&
        object.metadata.paymentIntent
    ) {
        const source = object;
        console.log(`🔔  The source ${source.id} failed or timed out.`);
        // Cancel the PaymentIntent.
        await stripe.paymentIntents.cancel(source.metadata.paymentIntent);
    }

    // Return a 200 success code to Stripe.
    respone.status(200).send("OKAY");
};

function calculatePaymentAmount(quantity, product_id, company, callback) {
    if (company == "Barquense") {
        moloniController.getProducts((res) => {
            if (res.products) {
                const products = res.products;

                let productsF = [];
                for (let i = 0; i < products.length; i++) {
                    if (products[i].name.toLowerCase().includes("único")) {
                        if (quantity >= 5) {
                            if (quantity % 5 != 0) {
                                if (products[i].product_id == product_id) {
                                    productsF.push({
                                        "qty": (quantity % 5),
                                        "price": parseFloat(products[i].price),
                                        "taxes": parseFloat(products[i].taxes[0].value)
                                    });
                                }
                            }
                            if (products[i].name.toLowerCase().includes("pack")) {
                                productsF.push({
                                    "qty": Math.floor(quantity / 5),
                                    "price": parseFloat(products[i].price),
                                    "taxes": parseFloat(products[i].taxes[0].value)
                                });
                            }
                        } else {
                            if (products[i].product_id == product_id) {
                                productsF.push({
                                    "qty": quantity,
                                    "price": parseFloat(products[i].price),
                                    "taxes": parseFloat(products[i].taxes[0].value)
                                });
                                break;
                            }
                        }
                    } else {
                        if (products[i].product_id == product_id) {
                            productsF.push({
                                "qty": quantity,
                                "price": parseFloat(products[i].price),
                                "taxes": parseFloat(products[i].taxes[0].value)
                            });
                            break;
                        }
                    }
                }
                if (productsF.length != 0) {
                    let amount = 0;
                    for (let i = 0; i < productsF.length; i++) {
                        amount += (productsF[i].qty * (productsF[i].price + products[i].taxes)).toFixed(2);
                    }
                    callback({
                        "orderAmount": amount
                    })
                } else {
                    callback({
                        "statusCode": 404,
                        "body": {
                            "message": "Product not found"
                        }
                    });
                }
            } else {
                callback({
                    "statusCode": res.statusCode,
                    "body": res.body
                });
            }
        })
    } else if (company == "Transdev") {
        jasminController.getProducts((res) => {
            if (res.products) {
                const products = res.products;

                let productsF = [];
                for (let i = 0; i < products.length; i++) {
                    if (products[i].description.toLowerCase().includes("único")) {
                        if (quantity >= 10) {
                            if (quantity % 10 != 0) {
                                if (products[i].itemKey == parseInt(product_id)) {
                                    productsF.push({
                                        "quantity": (quantity % 10),
                                        "unitPrice": parseFloat(products[i].priceListLines[0].priceAmount.amount)
                                    });
                                }
                            }
                            if (products[i].description.toLowerCase().includes("pack")) {
                                productsF.push({
                                    "quantity": Math.floor(quantity / 10),
                                    "unitPrice": parseFloat(products[i].priceListLines[0].priceAmount.amount)
                                });
                            }
                        } else {
                            if (products[i].itemKey == parseInt(product_id)) {
                                productsF.push({
                                    "quantity": quantity,
                                    "unitPrice": parseFloat(products[i].priceListLines[0].priceAmount.amount)
                                });
                                break;
                            }
                        }
                    } else {
                        if (products[i].itemKey == parseInt(product_id)) {
                            productsF.push({
                                "quantity": quantity,
                                "unitPrice": parseFloat(products[i].priceListLines[0].priceAmount.amount)
                            });
                            break;
                        }
                    }
                }
                if (productsF.length != 0) {
                    let amount = 0;
                    for (let i = 0; i < productsF.length; i++) {
                        amount += parseFloat((productsF[i].quantity * productsF[i].unitPrice).toFixed(2));
                    }
                    callback({
                        "orderAmount": amount
                    })
                } else {
                    callback({
                        "statusCode": 404,
                        "body": {
                            "message": "Product not found"
                        }
                    });
                }
            } else {
                callback({
                    "statusCode": res.statusCode,
                    "body": res.body
                });
            }
        })
    }
}

module.exports = {
    paymentIntent: paymentIntent,
    webhook: webhook
}