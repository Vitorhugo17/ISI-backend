const bCrypt = require('bcryptjs');

function getHome(request, response) {
    response.set('Content-Type', 'text/html');
    response.render('./example', {
        message: "Hello World!",
        hash: "",
        compare1: "",
        compare2: "",
        title: process.env.APP_NAME
    });
}

function comparePass(request, response) {
    const password = generatePass();
    const pass = bCrypt.hashSync(password, bCrypt.genSaltSync(10));
    
    response.set('Content-Type', 'text/html');
    response.render('./example', {
        message: `Password: ${password}`,
        hash: `Hash: ${pass}`,
        compare1: `Compare pass (${password}): ${bCrypt.compareSync(password, pass)}`,
        compare2: `Compare pass (pass12): ${bCrypt.compareSync("pass12", pass)}`,
        title: process.env.APP_NAME
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