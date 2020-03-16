const express = require('express');
const router = express.Router();
const bCrypt = require('bcryptjs');

router.get("/", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render('./example', {
        message: "Hello World!",
        title: "Example"
    });
})


function generateLink() {
    const length = 25,
        charSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0; i < length; ++i) {
        retVal += charSET.charAt(Math.floor(Math.random() * charSET.length));
    }
    return retVal;
}

module.exports = router;