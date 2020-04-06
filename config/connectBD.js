const mysql = require('mysql');
module.exports = mysql.createPool({
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b63553727b96b0',
    password: 'fd782d64',
    database: 'heroku_1f0b6a19dd5fe3a'
});