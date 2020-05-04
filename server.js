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

global.urlBase = `http://localhost:${process.env.PORT}`;
global.jasminUrl = `https://my.jasminsoftware.com/api/233711/233711-0001/`;
global.urlFront = `http://localhost:4242`

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
    limit: '50mb',
    verify: function (request, response, buffer) {
        if (request.originalUrl.startsWith('/webhook')) {
            request.rawBody = buffer.toString();
        }
    }
}), bodyParser.urlencoded({
    extended: true
}), );
app.use(sanitizer());
app.use(validator());

app.use(session({
    genid: (req) => {
        return uuid()
    },
    store: new RedisStore({
        client: require('redis').createClient({
            url: process.env.REDIS_URL
        }),
    }),
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
app.use('/', function (request, response, next) {
    response.header("Access-Control-Allow-Origin", urlFront);
    response.header("Access-Control-Allow-Credentials", true);
    response.header("Access-Control-Allow-Methods", "PUT, POST, OPTIONS, GET");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

require('./routes/auth.route')(app, passport);
app.use('/', require('./routes/main.routes'));

const server = app.listen(process.env.PORT, function () {
    console.log(`Listening at ${global.urlBase}`);
});

server.timeout = 100000;