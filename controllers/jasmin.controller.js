const querystring = require('querystring');
const req = require('request');
const connection = require('./../config/connection');

function getProducts(callback) {
    getToken((res)=> {
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
                    let result = [];
                    for (let i = 0; i < resp.length; i++) {
                        if (resp[i].itemKey != "PORTES") {
                            let json = {};
                            json.id = resp[i].itemKey;
                            json.name = resp[i].description;
                            json.price = resp[i].priceListLines[0].priceAmount.amount.toFixed(2);
                            json.measure = resp[i].unitDescription;
                            json.company = "Transdev";
                            json.quantity = 1;
                            result.push(json);
                        }
                    }
                    callback({
                        "products": result
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
                "body": JSON.parse(res.body)
            });
        }
    })
}

function getToken(callback) {
    let json = querystring.stringify({
        client_id: connection.jasmin.clientID,
        client_secret: connection.jasmin.secret,
        grant_type: "client_credentials",
        scope: "application"
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

module.exports = {
    getProducts: getProducts
};