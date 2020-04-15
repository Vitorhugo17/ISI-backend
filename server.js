require('dotenv').config();

const express = require('express');
const app = express();

const ip = require("ip");
const bodyParser = require('body-parser');
const validator = require('express-validator');
const sanitizer = require('express-sanitizer');
const session = require('express-session');
const uuid = require('uuid/v4');
const RedisStore = require('connect-redis')(session);
const passport = require('./config/passport');

global.urlBase = `https://isicampus-api.herokuapp.com`;
global.jasminUrl = `https://my.jasminsoftware.com/api/233711/233711-0001/`;
global.urlFront = `https://isicampus.herokuapp.com`

global.isLoggedIn = (request, response, next) => {
    if (request.isAuthenticated() && !request.user.isEmpresa) {
        next();
    } else {
        response.status(403).send({
            "message": "Não está autorizado a aceder a este conteudo"
        })
    }
}

global.isLoggedInCompany = (request, response, next) => {
    if (request.isAuthenticated() && request.user.isEmpresa) {
        next();
    } else {
        response.status(403).send({
            "message": "Não está autorizado a aceder a este conteudo"
        })
    }
}

app.use(bodyParser.json({
    limit: '50mb'
}), bodyParser.urlencoded({
    extended: true
}));
app.use(sanitizer());
app.use(validator());

app.set("trust proxy", 1);
app.use(session({
    /*genid: (req) => {
        return uuid()
    },
    store: new RedisStore({
        client: require('redis').createClient({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379
        }),
    }),*/
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false,
    cookie: {
        domain: "isicampus.herokuapp.com",
        maxAge: 1800000,
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//CORS
app.use('/', function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "https://isicampus.herokuapp.com");
    response.header("Access-Control-Allow-Credentials", true);
    response.header("Access-Control-Allow-Methods", "PUT, POST, OPTIONS, GET");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

require('./routes/auth.route')(app, passport);
app.use('/', require('./routes/main.routes'));

var server = app.listen(process.env.PORT, function () {
    console.log(`Listening at ${global.urlBase}`);
});

server.timeout = 100000;