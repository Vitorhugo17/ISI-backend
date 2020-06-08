const config = require('./../config/stripe.config');
const stripe = require('stripe')(config.stripe.secretKey);
const connect = require('./../config/connectBD');

const moloniController = require('./moloni.controller');
const jasminController = require('./jasmin.controller');
const mainController = require('./main.controller');


/* 
Função que permite recolher a publishable key do stripe
Retorna publishable key do stripe
*/
function getStripeKey(request, response) {
    response.status(200).send({
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
}

/* 
Função que verifica o estado do pagamento
Necessita do id do paymentIntent
Retorna o estado do pagamento
*/
async function paymentStatus(request, response) {
    const paymentIntent = await stripe.paymentIntents.retrieve(request.sanitize('id').escape());
    response.status(200).send({
        paymentIntent: {
            status: paymentIntent.status
        }
    });
};

/* 
Função que cria uma "intenção" de pagamento e que armazena os dados da compra numa tabela temporaria
Necessita da companhia, da quantidade comprada, do id do bilhete e que o utilizador esteja autenticado
Retorna o paymentIntent
*/
function paymentIntent(request, response) {
    const quantity = request.sanitize('quantity').escape();
    if (!quantity.match(/^[0-9]+$/)) {
        return response.status(400).json({
            "message": "Quantity not valid"
        });
    }
    const product_id = request.sanitize('product_id').escape();
    const company = request.sanitize('company').escape();
    const user_id = request.user.user_id;
    calculatePaymentAmount(parseInt(quantity), product_id, company, async (res) => {
        if (res.orderAmount) {
            const amount = res.orderAmount;
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: parseInt((amount * 100).toFixed(0)),
                    currency: config.currency,
                    payment_method_types: config.paymentMethods
                });
                const post = {
                    paymentIntent_id: paymentIntent.id,
                    idUtilizador: user_id,
                    idProduto: parseInt(product_id),
                    companhia: company,
                    quantidade: parseInt(quantity)
                }
                connect.query('INSERT INTO compras_temporaria SET ?', post, (err, rows) => {
                    if (!err) {
                        return response.status(200).json({
                            paymentIntent: paymentIntent
                        });
                    } else {
                        return response.status(400).json({
                            error: err.message
                        });
                    }
                })
            } catch (err) {
                return response.status(400).json({
                    error: err.message
                });
            }
        } else {
            return response.status(res.statusCode).json(res.body);
        }
    });
}

/* 
Função que permite ao stripe efetivar o pagamento e efetivar a compra se o pagamento for bem sucedido
*/
async function webhook(request, response) {
    let data;
    let eventType;
    if (config.stripe.webhookSecret) {
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
                'error': 'Webhook signature verification failed.'
            });
        }
        data = event.data;
        eventType = event.type;
    } else {
        data = request.body.data;
        eventType = request.body.type;
    }
    const object = data.object;

    if (object.object === 'payment_intent') {
        const paymentIntent = object;
        if (eventType === 'payment_intent.succeeded') {
            console.log(
                `🔔  Webhook received! Payment for PaymentIntent ${paymentIntent.id} succeeded.`
            );
            connect.query(`SELECT * FROM compras_temporaria WHERE paymentIntent_id='${paymentIntent.id}'`, (err, rows) => {
                if (!err) {
                    if (rows.length != 0) {
                        const purchase = rows[0];
                        const post = {
                            idUtilizador: purchase.idUtilizador,
                            idProduto: purchase.idProduto,
                            quantidade: purchase.quantidade
                        }
                        connect.query('INSERT INTO registo_produtos_comprados SET ?', post, (err, rows) => {
                            if (!err) {
                                mainController.insertPurchase(purchase.idUtilizador, purchase.idProduto, purchase.quantidade, purchase.companhia, (res) => {
                                    return response.status(res.statusCode).send(res.body);
                                })
                            } else {
                                return response.status(400).json({
                                    error: err.message
                                });
                            }
                        })
                    } else {
                        return response.status(400).json({
                            error: 'Payment not found'
                        });
                    }
                } else {
                    return response.status(400).json({
                        error: err.message
                    });
                }
            })
        } else if (eventType === 'payment_intent.payment_failed') {
            const paymentSourceOrMethod = paymentIntent.last_payment_error
                .payment_method ?
                paymentIntent.last_payment_error.payment_method :
                paymentIntent.last_payment_error.source;
            console.log(
                `🔔  Webhook received! Payment on ${paymentSourceOrMethod.object} ${paymentSourceOrMethod.id} of type ${paymentSourceOrMethod.type} for PaymentIntent ${paymentIntent.id} failed.`
            );
            return response.status(400).send('Payment Failed');
        }
    }

    if (
        object.object === 'source' &&
        object.status === 'chargeable' &&
        object.metadata.paymentIntent
    ) {
        const source = object;
        console.log(`🔔  Webhook received! The source ${source.id} is chargeable.`);
        const paymentIntent = await stripe.paymentIntents.retrieve(
            source.metadata.paymentIntent
        );
        if (paymentIntent.status != 'requires_payment_method') {
            return response.status(403).send({
                'error': 'requires_payment_method'
            });
        }
        await stripe.paymentIntents.confirm(paymentIntent.id, {
            source: source.id
        });
        return response.status(200).send('OK');
    }

    if (
        object.object === 'source' && ['failed', 'canceled'].includes(object.status) &&
        object.metadata.paymentIntent
    ) {
        const source = object;
        console.log(`🔔  The source ${source.id} failed or timed out.`);
        await stripe.paymentIntents.cancel(source.metadata.paymentIntent);
        return response.status(400).send('Payment Cancel');
    }
};

/* 
Função que permite calcular o valor a pagar
Necessita da companhia, da quantidade comprada e do id do bilhete
*/
function calculatePaymentAmount(quantity, product_id, company, callback) {
    if (company == 'Barquense') {
        moloniController.getProducts((res) => {
            if (res.products) {
                const products = res.products;
                let product;
                let productsF = [];
                for (let i = 0; i < products.length; i++) {
                    if (products[i].product_id == product_id) {
                        product = products[i];
                    }
                }

                if (product) {
                    if (product.name.toLowerCase().includes('único')) {
                        if (quantity >= 5) {
                            if (quantity % 5 != 0) {
                                productsF.push({
                                    'qty': (quantity % 5),
                                    'price': parseFloat(product.price),
                                    'taxes': parseFloat(product.taxes[0].value)
                                });
                            }
                            for (let i = 0; i < products.length; i++) {
                                if (products[i].name.toLowerCase().includes('pack')) {
                                    productsF.push({
                                        'qty': Math.floor(quantity / 5),
                                        'price': parseFloat(products[i].price),
                                        'taxes': parseFloat(products[i].taxes[0].value)
                                    });
                                }
                            }
                        } else {
                            productsF.push({
                                'qty': quantity,
                                'price': parseFloat(product.price),
                                'taxes': parseFloat(product.taxes[0].value)
                            });
                        }
                    } else {
                        productsF.push({
                            'qty': quantity,
                            'price': parseFloat(product.price),
                            'taxes': parseFloat(product.taxes[0].value)
                        });
                    }
                }
                if (productsF.length != 0) {
                    let amount = 0;
                    for (let i = 0; i < productsF.length; i++) {
                        amount += parseFloat((productsF[i].qty * (productsF[i].price + productsF[i].taxes)).toFixed(2));
                    }
                    callback({
                        'orderAmount': parseFloat(amount).toFixed(2)
                    })
                } else {
                    callback({
                        'statusCode': 404,
                        'body': {
                            'message': 'Product not found'
                        }
                    });
                }
            } else {
                callback({
                    'statusCode': res.statusCode,
                    'body': res.body
                });
            }
        })
    } else if (company == 'Transdev') {
        jasminController.getProducts((res) => {
            if (res.products) {
                const products = res.products;
                let product;
                let productsF = [];
                for (let i = 0; i < products.length; i++) {
                    if (products[i].itemKey == parseInt(product_id)) {
                        product = products[i];
                    }
                }
                if (product) {
                    if (product.description.toLowerCase().includes('único')) {
                        if (quantity >= 10) {
                            if (quantity % 10 != 0) {
                                productsF.push({
                                    'quantity': (quantity % 10),
                                    'unitPrice': parseFloat(product.priceListLines[0].priceAmount.amount)
                                });
                            }
                            for (let i = 0; i < products.length; i++) {
                                if (products[i].description.toLowerCase().includes('pack')) {
                                    productsF.push({
                                        'quantity': Math.floor(quantity / 10),
                                        'unitPrice': parseFloat(products[i].priceListLines[0].priceAmount.amount)
                                    });
                                }
                            }
                        } else {
                            productsF.push({
                                'quantity': quantity,
                                'unitPrice': parseFloat(product.priceListLines[0].priceAmount.amount)
                            });
                        }
                    } else {
                        productsF.push({
                            'quantity': quantity,
                            'unitPrice': parseFloat(product.priceListLines[0].priceAmount.amount)
                        });
                    }
                }

                if (productsF.length != 0) {
                    let amount = 0;
                    for (let i = 0; i < productsF.length; i++) {
                        amount += parseFloat((productsF[i].quantity * productsF[i].unitPrice).toFixed(2));
                    }
                    callback({
                        'orderAmount': parseFloat(amount).toFixed(2)
                    })
                } else {
                    callback({
                        'statusCode': 404,
                        'body': {
                            'message': 'Product not found'
                        }
                    });
                }
            } else {
                callback({
                    'statusCode': res.statusCode,
                    'body': res.body
                });
            }
        })
    } else {
        callback({
            'statusCode': 404,
            'body': "Company not found"
        });
    }
}

module.exports = {
    getStripeKey: getStripeKey,
    paymentStatus: paymentStatus,
    paymentIntent: paymentIntent,
    webhook: webhook
}