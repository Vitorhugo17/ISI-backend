const bCrypt = require('bcryptjs');

function getHome(request, response) {
    response.status(200).send({"message": "Hello World!"});
}

function comparePass(request, response) {
    const password = generatePass();
    const pass = bCrypt.hashSync(password, bCrypt.genSaltSync(10));
    
    response.status(200).send({
        "message": `Password: ${password}`,
        "hash": `Hash: ${pass}`,
        "compare1": `Compare pass (${password}): ${bCrypt.compareSync(password, pass)}`,
        "compare2": `Compare pass (pass12): ${bCrypt.compareSync("pass12", pass)}`,
        "title": process.env.APP_NAME
    });
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
    getHome: getHome,
    comparePass: comparePass
};