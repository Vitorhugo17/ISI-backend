/* eslint-disable no-undef */
/* eslint-disable no-console */
const port = 8080;
const express = require('express');

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

global.urlBase = `http://localhost:${port}/`;
/*global.notAuthorized = false;

global.isLoggedIn = function (request, response, next) {
  if (request.isAuthenticated()) {
    next();
  } else {
    global.notAuthorized = true;
    response.redirect("/");
  }
}*/

require('custom-env').env('staging');

app.use(validator());
app.use(bodyParser.json({
  limit: '24mb'
}), bodyParser.urlencoded({
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

var server = app.listen(port, function () {
  console.log(`worker ${process.pid}`);
  console.log(`Listening at localhost:${port}`);
});


server.timeout = 100000;