const querystring = require('querystring');
const req = require('request');
const connection = require('./../config/connection');

function getInvoices(callback) {
    getCompany((res) => {
        if (res.company_id) {
            const company_id = res.company_id;
            const access_token = res.access_token;

            let json = querystring.stringify({
                company_id: company_id,
                qty: 0,
                offset: 0,
                customer_id: 0,
                supplier_id: 0,
                salesman_id: 0,
                document_set_id: 0,
                number: 0,
                date: "",
                expiration_date: "",
                year: 0,
                your_reference: "",
                our_reference: ""
            });
            let options = {
                headers: {
                    'Content-Length': json.length,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: `https://api.moloni.pt/v1/invoices/getAll/?access_token=${access_token}`,
                body: json
            }
            req.post(options, (err, res) => {
                if (!err && res.statusCode == 200) {
                    let resp = JSON.parse(res.body);
                    callback({
                        "statusCode": res.statusCode,
                        "body": JSON.parse(res.body)
                    });
                } else {
                    callback({
                        "statusCode": res.statusCode,
                        "body": JSON.parse(res.body)
                    });
                }
            })
        }
    })
}

function insertPurchase(customer_id, product_id, quantity,status, callback) {
    getProducts((res) => {
        if (res.products) {
            const products = res.products;
            const company_id = res.company_id;
            const access_token = res.access_token;
            let product = {};
            for (let i = 0; i < products.length; i++) {
                if (products[i].product_id == product_id) {
                    product = products[i];
                    product = {
                        "product_id": product.product_id,
                        "name": product.name,
                        "summary": product.summary,
                        "qty": quantity,
                        "price": product.price,
                        "discount": 0,
                        "deduction_id": 0,
                        "order": 0,
                        "exemption_reason": "",
                        "taxes": [{
                            "tax_id": product.taxes[0].tax_id,
                            "value": product.taxes[0].value,
                            "order": product.taxes[0].order,
                            "cumulative": product.taxes[0].cumulative
                        }]
                    };
                    break;
                }
            }
            if (product.product_id) {
                let json = {
                    "company_id": company_id,
                    "date": new Date().toISOString(),
                    "expiration_date": new Date().toISOString(),
                    "maturity_date_id": 0,
                    "document_set_id": 269540,
                    "customer_id": customer_id,
                    "alternate_address_id": 0,
                    "our_reference": "Nossa referência",
                    "your_reference": "Referência Cliente",
                    "financial_discount": 0,
                    "eac_id": 0,
                    "salesman_id": 0,
                    "salesman_commision": 0,
                    "special_discount": 0,
                    "exchange_currency_id": 0,
                    "exchange_rate": 0,
                    "notes": "",
                    "status": status,
                    "net_value": 0,
                    "products": [product]
                };
                if (json.status == 1) {
                    json.payments = [{
                        "payment_method_id": 820244,
                        "date": new Date().toISOString(),
                        "value": (quantity * (product.price + product.taxes[0].value)).toFixed(2)
                    }]
                }

                let options = {
                    headers: {
                        'Content-Length': json.length,
                        'Content-Type': 'application/json'
                    },
                    url: `https://api.moloni.pt/v1/invoiceReceipts/insert/?access_token=${access_token}&json=true`,
                    body: JSON.stringify(json)
                }
                req.post(options, (err, res) => {
                    if (!err && res.statusCode == 200) {
                        callback({
                            "statusCode": res.statusCode,
                            "body": res.body
                        });
                    } else {
                        callback({
                            "statusCode": res.statusCode,
                            "body": res.body
                        });
                    }
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
                        "products": resp,
                        "company_id": company_id,
                        "access_token": access_token
                    });
                } else {
                    callback({
                        "statusCode": res.statusCode,
                        "body": JSON.parse(res.body)
                    });
                }
            })
        } else {
            callback({
                "statusCode": res.statusCode,
                "body": res.body
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
                        if (resBody[i].name == "Bilhetes") {
                            category_id = resBody[i].category_id
                        }
                    }
                    callback({
                        "company_id": company_id,
                        "access_token": access_token,
                        "category_id": category_id
                    });
                } else {
                    callback({
                        "statusCode": res.statusCode,
                        "body": JSON.parse(res.body)
                    });
                }
            })
        } else {
            callback({
                "statusCode": res.statusCode,
                "body": res.body
            });
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
                        if (resBody[i].email == connection.email.username) {
                            company_id = resBody[i].company_id;
                        }
                    }
                    if (company_id != -1) {
                        callback({
                            "company_id": company_id,
                            "access_token": access_token
                        });
                    } else {
                        callback({
                            "statusCode": 404,
                            "body": {
                                "message": "Company not found"
                            }
                        });
                    }
                } else {
                    callback({
                        "statusCode": res.statusCode,
                        "body": JSON.parse(res.body)
                    });
                }
            })
        } else {
            callback({
                "statusCode": res.statusCode,
                "body": res.body
            });
        }
    })
}

function getToken(callback) {
    let options = {
        url: `https://api.moloni.pt/v1/grant/?grant_type=password&client_id=${connection.moloni.clientID}&client_secret=${connection.moloni.secret}&username=${connection.email.username}&password=${connection.email.password}`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            callback({
                "access_token": JSON.parse(res.body).access_token
            });
        } else {
            callback({
                "statusCode": res.statusCode,
                "body": JSON.parse(res.body)
            });
        }
    })
}


function generatePass() {
    const length = 25,
        charSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0; i < length; ++i) {
        retVal += charSET.charAt(Math.floor(Math.random() * charSET.length));
    }
    return retVal;
}

module.exports = {
    getProducts: getProducts,
    getInvoices: getInvoices,
    insertPurchase: insertPurchase
};