/* eslint-disable no-undef */
/* eslint-disable no-console */
require('dotenv').config();

const express = require('express');

const ip = require("ip");
const bodyParser = require('body-parser');
const app = express();
const validator = require('express-validator');
/*const session = require('express-session');
const uuid = require('uuid/v4');
const RedisStore = require('connect-redis')(session);
const passport = require('./config/passport');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
*/

global.urlBase = `http://${ip.address()}:${process.env.PORT}/`;
/*global.notAuthorized = false;

global.isLoggedIn = function (request, response, next) {
  if (request.isAuthenticated()) {
    next();
  } else {
    global.notAuthorized = true;
    response.redirect("/");
  }
}*/


app.use(validator());
app.use(bodyParser.json({
  limit: '50mb',
  extended: true
}), bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

/*app.use(session({
  genid: (req) => {
    return uuid()
  },
  store: new RedisStore({port: process.env.REDIS_PORT}),
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1800000,
    httpOnly: true
  }
}))

app.use(passport.initialize());
app.use(passport.session());

require('./routes/auth.route')(app, passport);*/
require('./routes/main.routes')(app);

/*app.use(function (request, response, next) {
  response.locals = {
    user: request.user,
    ver: 1.1
  };
  next();
});*/

app.use('/', require('./controllers/example.controller.js'));

/*app.use(express.static(__dirname + '/public', {
  maxAge: 604800000
}));*/

app.set('view engine', 'ejs');
app.set('views', 'views');

var server = app.listen(process.env.PORT, function () {
  console.log(`Listening at ${global.urlBase}`);
});


server.timeout = 100000;