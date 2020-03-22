const bCrypt = require('bcryptjs');
const req = require('request');

function getPurchase(request, response) {
    let user_id = 101;
    let contacts = "";

    let options = {
        url: `https://api.hubapi.com/contacts/v1/lists/all/contacts/all?hapikey=${process.env.HUBSPOT_KEY}`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            contacts = JSON.parse(res.body).contacts;
            let c = [];
            for (let i = 0; i < contacts.length; i++) {
                if (contacts[i]["identity-profiles"][0].vid == user_id) {
                    c.push({
                        "contact": contacts[i],
                        "i": i
                    });
                }
            }
            response.send(JSON.stringify(c));
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
    getPurchase: getPurchase
};