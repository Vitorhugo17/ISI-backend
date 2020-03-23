const querystring = require('querystring');
const req = require('request');
const connection = require('./../config/connection');

function getP(request, response) {
    getToken((res) => {
        if (res.statusCode == 200) {
            let access_token = res.body.access_token;
            getCategories(access_token, (res) => {
                getProducts(res.body[0].category_id, access_token, (res) => {
                    response.status(res.statusCode).send(res.body);
                })
            })
        } else {
            response.status(res.statusCode).send(res.body);
        }
    })
}

function getProducts(categoryID, access_token, callback) {
    let json = querystring.stringify({
        company_id: 127251,
        category_id: categoryID,
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
            callback({
                "statusCode": res.statusCode,
                "body": JSON.parse(res.body)
            });
        } else {
            callback({
                "statusCode": res.statusCode,
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
                "statusCode": res.statusCode,
                "body": JSON.parse(res.body)
            });
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
    getP: getP
};