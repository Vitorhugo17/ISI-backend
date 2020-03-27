const querystring = require('querystring');
const req = require('request');
const connection = require('./../config/connection');

function getProducts(callback) {
    getToken((res) => {
        if (res.access_token) {
            let access_token = res.access_token;
            getCategories(access_token, (res) => {
                if (res.category_id) {
                    let json = querystring.stringify({
                        company_id: 127251,
                        category_id: res.category_id,
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
                            let result = [];
                            for (let i = 0; i < resp.length; i++) {
                                let json = {};
                                json.id = resp[i].product_id;
                                json.name = resp[i].name;
                                json.price = (resp[i].price + resp[i].taxes[0].value).toFixed(2);
                                json.measure = resp[i].measurement_unit.name;
                                json.company = "Barquense";
                                if (resp[i].child_products[0]) {
                                    json.quantity = resp[i].child_products[0].qty;
                                } else {
                                    json.quantity = 1;
                                }
                                result.push(json);
                            }
                            callback({
                                "products": result
                            });
                        } else {
                            callback({
                                "statusCode":  res.statusCode,
                                "body": JSON.parse(res.body)
                            });
                        }
                    })
                } else {
                    callback({
                        "statusCode":  res.statusCode,
                        "body": res.body
                    });
                }
            })
        } else {
            callback({
                "statusCode":  res.statusCode,
                "body": res.body
            });
        }
    })
}

function getCategories(access_token, callback) {
    let json = querystring.stringify({
        company_id: 127251,
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
            callback({
                "category_id": JSON.parse(res.body)[0].category_id
            });
        } else {
            callback({
                "statusCode": res.statusCode,
                "body": JSON.parse(res.body)
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
    getProducts: getProducts
};