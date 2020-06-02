const querystring = require('querystring');
const req = require('request');

function getPDFLink(document_id, callback) {
    getCompany((res) => {
        if (res.company_id) {
            const company_id = res.company_id;
            const access_token = res.access_token;

            let json = querystring.stringify({
                company_id: company_id,
                document_id: document_id
            });
            let options = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: `https://api.moloni.pt/v1/documents/getPDFLink/?access_token=${access_token}`,
                body: json
            }
            req.post(options, (err, res) => {
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
            });

        }
    })
}

function insertClient(nif, nome, email, callback) {
    getNextNumber((res) => {
        if (res.company_id) {
            const company_id = res.company_id;
            const access_token = res.access_token;
            const next_number = res.next_number;

            const json = querystring.stringify({
                company_id: company_id,
                vat: nif,
                number: next_number,
                name: nome,
                language_id: 1,
                address: '',
                zip_code: '',
                city: '',
                country_id: 1,
                email: email,
                website: '',
                phone: '',
                fax: '',
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                notes: '',
                salesman_id: 0,
                price_class_id: 0,
                maturity_date_id: 0,
                payment_day: 0,
                discount: 0,
                credit_limit: 0,
                payment_method_id: 0,
                delivery_method_id: 0,
                field_notes: ''
            })

            let options = {
                headers: {
                    'Content-Length': json.length,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: `https://api.moloni.pt/v1/customers/insert/?access_token=${access_token}`,
                body: json
            }
            req.post(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    callback({
                        'statusCode': res.statusCode,
                        'body': {
                            customer_id: JSON.parse(res.body).customer_id
                        }
                    })
                } else {
                    callback({
                        'statusCode': res.statusCode,
                        'body': JSON.parse(res.body)
                    })
                }
            })
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': res.body
            });
        }
    })
}

function getPurchases(customer_id, callback) {
    getCompany((res) => {
        if (res.company_id) {
            const company_id = res.company_id;
            const access_token = res.access_token;

            let json = querystring.stringify({
                company_id: company_id,
                qty: 0,
                offset: 0,
                customer_id: customer_id,
                supplier_id: 0,
                salesman_id: 0,
                document_set_id: 0,
                number: 0,
                date: '',
                expiration_date: '',
                year: 0,
                your_reference: '',
                our_reference: ''
            });
            let options = {
                headers: {
                    'Content-Length': json.length,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: `https://api.moloni.pt/v1/invoiceReceipts/getAll/?access_token=${access_token}`,
                body: json
            }
            req.post(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let invoices = JSON.parse(res.body);
                    let invoicesF = [];
                    for (let i = 0; i < invoices.length; i++) {
                        if (invoices[i].status == 1) {
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
            });

        }
    })
}

function insertPurchase(customer_id, product_id, quantity, status, callback) {
    getProducts((res) => {
        if (res.products) {
            const products = res.products;
            const company_id = res.company_id;
            const access_token = res.access_token;

            let productsF = [];
            for (let i = 0; i < products.length; i++) {
                if (products[i].name.toLowerCase().includes('único')) {
                    if (quantity >= 5) {
                        if (quantity % 5 != 0) {
                            if (products[i].product_id == product_id) {
                                productsF.push({
                                    'product_id': products[i].product_id,
                                    'name': products[i].name,
                                    'summary': products[i].summary,
                                    'qty': (quantity % 5),
                                    'price': products[i].price,
                                    'discount': 0,
                                    'deduction_id': 0,
                                    'order': 0,
                                    'exemption_reason': '',
                                    'taxes': [{
                                        'tax_id': products[i].taxes[0].tax_id,
                                        'value': products[i].taxes[0].value,
                                        'order': products[i].taxes[0].order,
                                        'cumulative': products[i].taxes[0].cumulative
                                    }]
                                });
                            }
                        }
                        if (products[i].name.toLowerCase().includes('pack')) {
                            productsF.push({
                                'product_id': products[i].product_id,
                                'name': products[i].name,
                                'summary': products[i].summary,
                                'qty': Math.floor(quantity / 5),
                                'price': products[i].price,
                                'discount': 0,
                                'deduction_id': 0,
                                'order': 0,
                                'exemption_reason': '',
                                'taxes': [{
                                    'tax_id': products[i].taxes[0].tax_id,
                                    'value': products[i].taxes[0].value,
                                    'order': products[i].taxes[0].order,
                                    'cumulative': products[i].taxes[0].cumulative
                                }]
                            });
                        }
                    } else {
                        if (products[i].product_id == product_id) {
                            productsF.push({
                                'product_id': products[i].product_id,
                                'name': products[i].name,
                                'summary': products[i].summary,
                                'qty': quantity,
                                'price': products[i].price,
                                'discount': 0,
                                'deduction_id': 0,
                                'order': 0,
                                'exemption_reason': '',
                                'taxes': [{
                                    'tax_id': products[i].taxes[0].tax_id,
                                    'value': products[i].taxes[0].value,
                                    'order': products[i].taxes[0].order,
                                    'cumulative': products[i].taxes[0].cumulative
                                }]
                            });
                            break;
                        }
                    }
                } else {
                    if (products[i].product_id == product_id) {
                        productsF.push({
                            'product_id': products[i].product_id,
                            'name': products[i].name,
                            'summary': products[i].summary,
                            'qty': quantity,
                            'price': products[i].price,
                            'discount': 0,
                            'deduction_id': 0,
                            'order': 0,
                            'exemption_reason': '',
                            'taxes': [{
                                'tax_id': products[i].taxes[0].tax_id,
                                'value': products[i].taxes[0].value,
                                'order': products[i].taxes[0].order,
                                'cumulative': products[i].taxes[0].cumulative
                            }]
                        });
                        break;
                    }
                }
            }
            if (productsF.length != 0) {
                let json = {
                    'company_id': company_id,
                    'date': new Date().toISOString(),
                    'expiration_date': new Date().toISOString(),
                    'maturity_date_id': 0,
                    'document_set_id': 269540,
                    'customer_id': customer_id,
                    'alternate_address_id': 0,
                    'our_reference': 'Nossa referência',
                    'your_reference': 'Referência Cliente',
                    'financial_discount': 0,
                    'eac_id': 0,
                    'salesman_id': 0,
                    'salesman_commision': 0,
                    'special_discount': 0,
                    'exchange_currency_id': 0,
                    'exchange_rate': 0,
                    'notes': '',
                    'status': status,
                    'net_value': 0,
                    'products': productsF
                };
                if (json.status == 1) {
                    let total = 0;
                    for (let i = 0; i < productsF.length; i++) {
                        total += (productsF[i].qty * (productsF[i].price + products[i].taxes[0].value)).toFixed(2);
                    }
                    json.payments = [{
                        'payment_method_id': 820244,
                        'date': new Date().toISOString(),
                        'value': total
                    }]
                }

                let options = {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    url: `https://api.moloni.pt/v1/invoiceReceipts/insert/?access_token=${access_token}&json=true`,
                    body: JSON.stringify(json)
                }
                req.post(options, (err, res) => {
                    if (!err && res.statusCode == 200) {
                        callback({
                            'statusCode': res.statusCode,
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
                });
            }
        } else {
            callback({
                'statusCode': res.statusCode,
                'body': res.body
            });
        }
    })
}


function getProducts(callback) {
    getCategory((res) => {
        if (res.category_id) {
            const access_token = res.access_token;
            const company_id = res.company_id;
            const category_id = res.category_id;
            let json = querystring.stringify({
                company_id: company_id,
                category_id: category_id,
                qty: 0,
                offset: 0,
                with_invisible: 0
            });
            let options = {
                headers: {
                    'Content-Length': json.length,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: `https://api.moloni.pt/v1/products/getAll/?access_token=${access_token}`,
                body: json
            }
            req.post(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let resp = JSON.parse(res.body);
                    callback({
                        'products': resp,
                        'company_id': company_id,
                        'access_token': access_token
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
            });
        }
    })
}

function getCategory(callback) {
    getCompany((res) => {
        if (res.company_id) {
            let access_token = res.access_token;
            let company_id = res.company_id;
            let json = querystring.stringify({
                company_id: company_id,
                parent_id: 0
            });
            let options = {
                headers: {
                    'Content-Length': json.length,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: `https://api.moloni.pt/v1/productCategories/getAll/?access_token=${access_token}`,
                body: json
            }
            req.post(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let resBody = JSON.parse(res.body);
                    let category_id = -1;
                    for (let i = 0; i < resBody.length; i++) {
                        if (resBody[i].name == 'Bilhetes') {
                            category_id = resBody[i].category_id
                        }
                    }
                    callback({
                        'company_id': company_id,
                        'access_token': access_token,
                        'category_id': category_id
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
            });
        }
    })
}

function getNextNumber(callback) {
    getCompany((res) => {
        if (res.company_id) {
            const company_id = res.company_id;
            const access_token = res.access_token;

            const json = querystring.stringify({
                company_id: company_id
            })
            let options = {
                headers: {
                    'Content-Length': json.length,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: `https://api.moloni.pt/v1/customers/getNextNumber/?access_token=${access_token}`,
                body: json
            }

            req.post(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    callback({
                        'company_id': company_id,
                        'access_token': access_token,
                        'next_number': JSON.parse(res.body).number
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

function getCompany(callback) {
    getToken((res) => {
        if (res.access_token) {
            const access_token = res.access_token;
            let options = {
                url: `https://api.moloni.pt/v1/companies/getAll/?access_token=${access_token}`
            }
            req.get(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let resBody = JSON.parse(res.body);
                    let company_id = -1;
                    for (let i = 0; i < resBody.length; i++) {
                        if (resBody[i].email == process.env.EMAIL_USERNAME) {
                            company_id = resBody[i].company_id;
                        }
                    }
                    if (company_id != -1) {
                        callback({
                            'company_id': company_id,
                            'access_token': access_token
                        });
                    } else {
                        callback({
                            'statusCode': 404,
                            'body': {
                                'message': 'Company not found'
                            }
                        });
                    }
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
            });
        }
    })
}

function getToken(callback) {
    let options = {
        url: `https://api.moloni.pt/v1/grant/?grant_type=password&client_id=${process.env.MOLONI_CLIENTID}&client_secret=${process.env.MOLONI_SECRET}&username=${process.env.EMAIL_USERNAME}&password=${process.env.MOLONI_PASSWORD}`
    }
    req.get(options, (err, res) => {
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
    getPurchases: getPurchases,
    insertPurchase: insertPurchase,
    insertClient: insertClient,
    getPDFLink: getPDFLink
};