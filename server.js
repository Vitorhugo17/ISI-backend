require('dotenv').config();

const express = require('express');
const app = express();


const cors = require("cors");
const ip = require("ip");
const bodyParser = require('body-parser');
const validator = require('express-validator');
const sanitizer = require('express-sanitizer');
const session = require('express-session');
const uuid = require('uuid/v4');
const RedisStore = require('connect-redis')(session);
const passport = require('./config/passport');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

global.urlBase = `http://${ip.address()}:${process.env.PORT}`;
global.jasminUrl = `https://my.jasminsoftware.com/api/233711/233711-0001/`;

global.isLoggedIn = (request, response, next) => {
    if (request.isAuthenticated()) {
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
        maxAge: 1800000,
        httpOnly: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//CORS
app.use(cors());
app.use(function (request, response, next) {
    console.log(response.cookie().session);
    response.setHeader("Access-Control-Allow-Origin", "https://test-isicampus.herokuapp.com");
    response.setHeader("Access-Control-Allow-Credentials", true);
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

require('./routes/auth.route')(app, passport);
app.use('/', require('./routes/main.routes'));

app.use(function (request, response, next) {
    response.locals = {
        user: request.user,
        ver: 1.0
    };
    next();
});


var server = app.listen(process.env.PORT, function () {
    console.log(`Listening at ${global.urlBase}`);
});

server.timeout = 100000;