const querystring = require('querystring');
const req = require('request');

function getPDFDocument(document_id, callback) {
    const x = document_id.split(".");
    const documentType = x[0];
    const seriesNumber = x[1];
    const documentNumber = x[2];
    getToken((res) => {
        if (res.access_token) {
            const access_token = res.access_token;

            let options = {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                },
                encoding: null,
                url: `${global.jasminUrl}billing/invoices/TRANSDEV/${documentType}/${seriesNumber}/${documentNumber}/print`
            }
            req.get(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    callback({
                        'statusCode': res.statusCode,
                        'body': res.body
                    });
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': JSON.parse(res.body)
                    });
                }
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': res.body
            })
        }
    })
}

function getPurchases(customer_id, callback) {
    getToken((res) => {
        if (res.access_token) {
            const access_token = res.access_token;

            let options = {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                },
                url: `${global.jasminUrl}billing/invoices`
            }
            req.get(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let invoices = JSON.parse(res.body);
                    let invoicesF = [];
                    for (let i = 0; i < invoices.length; i++) {
                        if (invoices[i].buyerCustomerParty == customer_id && !invoices[i].isDeleted) {
                            invoicesF.push(invoices[i]);
                        }
                    }

                    callback({
                        'statusCode': res.statusCode,
                        'body': invoicesF
                    });
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': JSON.parse(res.body)
                    });
                }
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': res.body
            })
        }
    })
}

function insertClient(nome, callback) {
    getToken((res) => {
        if (res.access_token) {
            const access_token = res.access_token;

            const json = {
                'name': nome,
                'isExternallyManaged': false,
                'currency': 'EUR',
                'isPerson': true,
                'country': 'PT'
            };
            let options = {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': JSON.stringify(json).length
                },
                url: `${global.jasminUrl}salescore/customerParties`,
                body: JSON.stringify(json)
            }
            req.post(options, (err, res) => {
                if (!err && res.statusCode == 201) {
                    const record_id = JSON.parse(res.body);

                    options = {
                        headers: {
                            'Authorization': `Bearer ${access_token}`
                        },
                        url: `${global.jasminUrl}salescore/customerParties/${record_id}`
                    }
                    req.get(options, (err, res) => {
                        if (!err && res.statusCode == 200) {
                            callback({
                                'statusCode': res.statusCode,
                                'body': {
                                    customer_id: JSON.parse(res.body).partyKey
                                }
                            })
                        } else {
                            callback({
                                'statusCode': res.statusCode,
                                'body': res.body
                            })
                        }
                    })
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': res.body
                    })
                }
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': res.body
            })
        }
    })
}


function insertPurchase(customer_id, customer_name, customer_nif, product_id, quantity, callback) {
    getInvoiceType((res) => {
        if (res.invoiceType) {
            const access_token = res.access_token;
            const invoiceType = res.invoiceType;
            getProducts((res) => {
                if (res.products) {
                    const products = res.products;

                    let product;
                    for (let i = 0; i < products.length; i++) {
                        if (products[i].product_id == product_id) {
                            product = products[i];
                            break;
                        }
                    }

                    let productsF = [];
                    if (product) {
                        if (product.description.toLowerCase().includes('único')) {
                            if (quantity >= 10) {
                                if (quantity % 10 != 0) {
                                    productsF.push({
                                        'salesItem': product.itemKey,
                                        'description': product.description,
                                        'quantity': (quantity % 10),
                                        'unitPrice': product.priceListLines[0].priceAmount,
                                        'unit': product.priceListLines[0].unit,
                                        'itemTaxSchema': product.itemTaxSchema,
                                        'deliveryDate': new Date().toISOString()
                                    });
                                }
                                for (let i = 0; i < products.length; i++) {
                                    if (products[i].description.toLowerCase().includes('pack')) {
                                        productsF.push({
                                            'salesItem': products[i].itemKey,
                                            'description': products[i].description,
                                            'quantity': Math.floor(quantity / 10),
                                            'unitPrice': products[i].priceListLines[0].priceAmount,
                                            'unit': products[i].priceListLines[0].unit,
                                            'itemTaxSchema': products[i].itemTaxSchema,
                                            'deliveryDate': new Date().toISOString()
                                        });
                                        break;
                                    }
                                }
                            } else {
                                productsF.push({
                                    'salesItem': product.itemKey,
                                    'description': product.description,
                                    'quantity': (quantity % 10),
                                    'unitPrice': product.priceListLines[0].priceAmount,
                                    'unit': product.priceListLines[0].unit,
                                    'itemTaxSchema': product.itemTaxSchema,
                                    'deliveryDate': new Date().toISOString()
                                });
                            }
                        } else {
                            productsF.push({
                                'salesItem': product.itemKey,
                                'description': product.description,
                                'quantity': (quantity % 10),
                                'unitPrice': product.priceListLines[0].priceAmount,
                                'unit': product.priceListLines[0].unit,
                                'itemTaxSchema': product.itemTaxSchema,
                                'deliveryDate': new Date().toISOString()
                            });
                            break;
                        }
                    }
                    if (productsF.length != 0) {
                        let json = {
                            'documentType': 'FR',
                            'serie': invoiceType.serie,
                            'seriesNumber': invoiceType.currentNumber,
                            'company': 'Transdev',
                            'paymentTerm': '00',
                            'paymentMethod': 'MB',
                            'currency': 'EUR',
                            'documentDate': new Date().toISOString(),
                            'postingDate': new Date().toISOString(),
                            'buyerCustomerParty': customer_id,
                            'buyerCustomerPartyName': customer_name,
                            'buyerCustomerPartyTaxId': customer_nif,
                            'exchangeRate': 1,
                            'discount': 0,
                            'loadingCountry': 'PT',
                            'unloadingCountry': 'PT',
                            'financialAccount': '01',
                            'isExternal': false,
                            'isManual': false,
                            'isSimpleInvoice': false,
                            'isWsCommunicable': false,
                            'deliveryTerm': 'EM-MAO',
                            'documentLines': productsF,
                            'WTaxTotal': {
                                'amount': 0,
                                'baseAmount': 0,
                                'reportingAmount': 0,
                                'fractionDigits': 2,
                                'symbol': '€'
                            },
                            'TotalLiability': {
                                'baseAmount': 0,
                                'reportingAmount': 0,
                                'fractionDigits': 2,
                                'symbol': '€'
                            }
                        }

                        let options = {
                            headers: {
                                'Authorization': `Bearer ${access_token}`,
                                'Content-Type': 'application/json; charset=utf-8',
                                'Content-Length': JSON.stringify(json).length
                            },
                            url: `${global.jasminUrl}billing/invoices`,
                            body: JSON.stringify(json)
                        }

                        req.post(options, (err, res) => {
                            if (!err && res.statusCode == 201) {
                                callback({
                                    'statusCode': 200,
                                    'body': {
                                        'message': 'Purchase inserted with success'
                                    }
                                });
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
                            'body': {
                                'message': 'Product not found'
                            }
                        })
                    }
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': res.body
                    })
                }
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': res.body
            })
        }
    })
}


function getInvoiceType(callback) {
    getToken((res) => {
        if (res.access_token) {
            const access_token = res.access_token;

            let options = {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                },
                url: `${global.jasminUrl}salesCore/invoiceTypes`
            }
            req.get(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let resp = JSON.parse(res.body);
                    let invoiceType;
                    for (let i = 0; i < resp.length; i++) {
                        if (resp[i].company == 'TRANSDEV' && resp[i].typeKey == 'FR') {
                            invoiceType = resp[i];
                        }
                    }
                    callback({
                        'invoiceType': invoiceType.documentTypeSeries[0],
                        'access_token': access_token
                    });
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': JSON.parse(res.body)
                    });
                }
            })
        }
    })
}

function getProducts(callback) {
    getToken((res) => {
        if (res.access_token) {
            let access_token = res.access_token;

            let options = {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                },
                url: `${global.jasminUrl}salesCore/salesItems`
            }
            req.get(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let resp = JSON.parse(res.body);
                    callback({
                        'products': resp
                    });
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': JSON.parse(res.body)
                    });
                }
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

function getToken(callback) {
    let json = querystring.stringify({
        client_id: process.env.JASMIN_CLIENTID,
        client_secret: process.env.JASMIN_SECRET,
        grant_type: 'client_credentials',
        scope: 'application'
    });

    let options = {
        headers: {
            'Content-Length': json.length,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: `https://identity.primaverabss.com/core/connect/token`,
        body: json
    }
    req.post(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                'access_token': JSON.parse(res.body).access_token
            });
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': JSON.parse(res.body)
            });
        }
    })
}

module.exports = {
    getProducts: getProducts,
    insertPurchase: insertPurchase,
    insertClient: insertClient,
    getPurchases: getPurchases,
    getPDFDocument: getPDFDocument
};