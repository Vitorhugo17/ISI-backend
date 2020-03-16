/* eslint-disable no-undef */
/* eslint-disable no-console */
const port = 3050;
const express = require('express');

const bodyParser = require('body-parser');
const app = express();
const validator = require('express-validator');
const session = require('express-session');
const uuid = require('uuid/v4');
const RedisStore = require('connect-redis')(session);
const passport = require('./config/passport');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const req = require('request');

global.urlBaseGo = `http://localhost:9050/`;
global.urlBaseNode = `http://localhost:3050/`;
global.urlBaseNodeMail = `https://homepharma.ddns.net/`;
global.notAuthorized = false;
global.todayDoses = [];
global.otherDayDoses = [];

global.isLoggedIn = function (request, response, next) {
  if (request.isAuthenticated()) {
    next();
  } else {
    global.notAuthorized = true;
    response.redirect("/");
  }
}

global.isLoggedInUser = function (request, response, next) {
  if (request.isAuthenticated() && request.user.tipo == "user") {
    next();
  } else {
    global.notAuthorized = true;
    response.redirect("/");
  }
}

global.isLoggedInAdmin = function (request, response, next) {
  if (request.isAuthenticated() && request.user.tipo == "admin") {
    next();
  } else {
    global.notAuthorized = true;
    response.redirect("/");
  }
}
//função para criar as tomas de hoje
new CronJob('00 00 00 * * *', () => {
  let today = new Date();
  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (todayDoses.length == 0) {
    const options = {
      url: `${urlBaseGo}schedulings`
    }
    req.get(options, (err, res) => {
      if (!err && res.statusCode == 200) {
        const schedulings = JSON.parse(res.body);
        let scheds = [];

        schedulings.forEach((element) => {
          if (element.dataHoraFim.Valid) {
            if (new Date(element.dataHoraFim.String) > today) {
              scheds.push(element);
            }
          } else {
            scheds.push(element);
          }
        });

        scheds.forEach((element) => {
          let nextDose = new Date(element.dataHoraParcial);
          while (nextDose < tomorrow) {
            if (nextDose >= today && nextDose < tomorrow) {
              let data = {};
              data.dataPrevista = new Date(nextDose);
              data.idAgendamento = element.idAgendamento;
              todayDoses.push(data);
            }
            
            if (element.medida == "Dia(s)") {
              nextDose.setDate(nextDose.getDate() + element.periodoToma);
            } else if (element.medida == "Hora(s)") {
              nextDose.setHours(nextDose.getHours() + element.periodoToma);
            } else if (element.medida == "Semana(s)") {
              nextDose.setDate(nextDose.getDate() + (7 * element.periodoToma));
            } else if (element.medida == "Mes(es)") {
              nextDose.setMonth(nextDose.getMonth() + element.periodoToma);
            } else if (element.medida == "Ano(s)") {
              nextDose.setYear(nextDose.getFullYear() + element.periodoToma);
            }
          }
        })
      }
    })
  } else {
    otherDayDoses = todayDoses.splice(0, todayDoses.length);
  }
}).start();

//função para retirar as tomas que passaram das tomas de hoje
new CronJob("00 */2 * * * *", () => {
for (let i = 0; i < todayDoses.length; i++) {
    if (new Date(todayDoses[i].dataPrevista) < new Date()) {
      otherDayDoses.push(todayDoses.splice(i, 1));

    }
  }
}).start();

//função para guardar as tomas que não foram efetivadas
new CronJob("59 */2 * * * *", () => {
  if (otherDayDoses.length != 0) {
    let dose = otherDayDoses.splice(0, 1);

    const options = {
      url: `${urlBaseGo}doses/notconfirmed`,
      body: JSON.stringify(dose[0])
    }

    req.post(options, (err, res) => {
      if (!err && res.statusCode == 200) {
        console.log('OK')
      } else {
        otherDayDoses.unshift(dose[0]);
      }
    })
  }
})

//função que gera as notificações
new CronJob('00 00 01 * * *', () => {
  let erroCronJob = "";
  const options = {
    url: `${urlBaseGo}users`
  }

  req.get(options, (err, res) => {
    if (!err && res.statusCode == 200) {
      let usersT = JSON.parse(res.body);
      let users = [];

      for (let i = 0; i < usersT.length; i++) {
        if (usersT[i].estado == 1 && usersT[i].tipo == "1") {
          users.push({
            idPessoa: usersT[i].idPessoa,
            email: usersT[i].email
          });
        }
      }

      const options1 = {
        url: `${urlBaseGo}people`
      }

      req.get(options1, (err1, res1) => {
        if (!err1 && res1.statusCode == 200) {
          const people = JSON.parse(res1.body);

          for (let i = 0; i < users.length; i++) {
            users[i].people = [];
            for (let j = 0; j < people.length; j++) {
              if (users[i].idPessoa == people[j].idPessoa) {
                users[i].nomePessoa = people[j].nome;
                users[i].idGrupo = people[j].idGrupo;
              }
            }

            for (let j = 0; j < people.length; j++) {
              if (users[i].idGrupo == people[j].idGrupo) {
                users[i].people.push(people[j])
              }
            }
          }

          const options2 = {
            url: `${urlBaseGo}schedulings`
          }

          req.get(options2, (err2, res2) => {
            if (!err2 && res2.statusCode == 200) {
              const schedulings = JSON.parse(res2.body);

              const options3 = {
                url: `${urlBaseGo}products/bought`
              }

              req.get(options3, (err3, res3) => {
                if (!err3 && res3.statusCode == 200) {
                  const bProducts = JSON.parse(res3.body);

                  const options4 = {
                    url: `${urlBaseGo}products`
                  }

                  req.get(options4, (err4, res4) => {
                    if (!err4 && res4.statusCode == 200) {
                      const products = JSON.parse(res4.body);

                      for (let i = 0; i < bProducts.length; i++) {
                        for (let j = 0; j < products.length; j++) {
                          if (bProducts[i].idProduto == products[j].idProduto) {
                            bProducts[i].nomeProduto = products[j].nomeComum;
                          }
                        }
                      }

                      let usersMail = [];

                      let endDay = new Date();
                      endDay.setDate(endDay.getDate() + 7);

                      for (let i = 0; i < users.length; i++) {
                        let user = users[i];
                        user.endProds = [];
                        for (let j = 0; j < user.people.length; j++) {
                          let person = user.people[j];
                          person.doses = [];
                          for (let x = 0; x < schedulings.length; x++) {
                            if (schedulings[x].idPessoa == person.idPessoa) {
                              for (let y = 0; y < todayDoses.length; y++) {
                                if (schedulings[x].idAgendamento == todayDoses[y].idAgendamento) {
                                  for (let z = 0; z < products.length; z++) {
                                    if (products[z].idProduto == schedulings[x].idProduto) {
                                      let dose = todayDoses[y];
                                      dose.nomeProduto = products[z].nomeComum
                                      person.doses.push(dose);
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }

                        for (let j = 0; j < bProducts.length; j++) {
                          if (bProducts[j].idGrupo == user.idGrupo) {
                            if (bProducts[j].dataExpiracao.Valid) {
                              if ((new Date(bProducts[j].validadeProduto) > new Date() && new Date(bProducts[j].validadeProduto) < endDay) || (new Date(bProducts[j].dataExpiracao.String) > new Date() && new Date(bProducts[j].dataExpiracao.String) < endDay)) {
                                user.endProds.push(bProducts[j])
                              }
                            } else {
                              if (new Date(bProducts[j].validadeProduto) > new Date() && new Date(bProducts[j].validadeProduto) < endDay) {
                                user.endProds.push(bProducts[j])
                              }
                            }
                          }
                        }
                        usersMail.push(user);
                      }

                      const transporter = nodemailer.createTransport(smtpTransport({
                        service: 'Gmail',
                        auth: {
                          user: 'homepharmapt@gmail.com',
                          pass: 'H0mePharma123'
                        },
                        tls: {
                          // do not fail on invalid certs
                          rejectUnauthorized: false
                        }
                      }));
                      transporter.verify(function (error, success) {
                        if (error) {
                          console.log(error);
                        }
                      });

                      for (let i = 0; i < usersMail.length; i++) {
                        let txtDoses = "Produtos a tomar hoje: <br>";
                        for (let j = 0; j < usersMail[i].people.length; j++) {
                          for (let x = 0; x < usersMail[i].people[j].doses.length; x++) {
                            if (x != usersMail[i].people[j].doses.length - 1) {
                              txtDoses += `${usersMail[i].people[j].doses[x].nomeComum} <br>`
                            } else {
                              txtDoses += `${usersMail[i].people[j].doses[x].nomeComum} <br><br>`
                            }
                          }
                        }
                        let txtProds = "Produtos a terminar/expirar nos próximos 7 dias: <br>";
                        for (let j = 0; j < usersMail[i].endProds.length; j++) {
                          if (j != usersMail[i].endProds.length - 1) {
                            txtProds += `${usersMail[i].endProds[j].nomeProduto}(${usersMail[i].endProds[j].designacao})<br>`
                          } else {
                            txtProds += `${usersMail[i].endProds[j].nomeProduto}(${usersMail[i].endProds[j].designacao})<br><br>`
                          }
                        }
                        let bodycontent = "";
                        if (txtDoses != "Produtos a tomar hoje: <br>" && txtProds != "Produtos a terminar/expirar nos próximos 7 dias: <br>") {
                          bodycontent = `Caro(a) ${usersMail[i].nomePessoa}, <br><br>
                          Pode consultar neste email o resumo diário da sua conta onde constam as suas tomas para o dia de hoje assim como os produtos cujas validades estão a terminar.<br><br>
                          ${txtDoses}
                          ${txtProds}
                          Com votos de um ótimo dia, <br> 
                          Equipa HomePharma`;
                        } else if (txtDoses == "Produtos a tomar hoje: <br>" && txtProds != "Produtos a terminar/expirar nos próximos 7 dias: <br>") {
                          bodycontent = `Caro(a) ${usersMail[i].nomePessoa}, <br><br>
                          Pode consultar neste email o resumo diário da sua conta onde constam as suas tomas para o dia de hoje assim como os produtos cujas validades estão a terminar.<br><br>
                          ${txtProds}
                          Com votos de um ótimo dia, <br> 
                          Equipa HomePharma`;
                        } else if (txtDoses != "Produtos a tomar hoje: <br>" && txtProds == "Produtos a terminar/expirar nos próximos 7 dias: <br>") {
                          bodycontent = `Caro(a) ${usersMail[i].nomePessoa}, <br><br>
                          Pode consultar neste email o resumo diário da sua conta onde constam as suas tomas para o dia de hoje assim como os produtos cujas validades estão a terminar.<br><br>
                          ${txtDoses}
                          Com votos de um ótimo dia, <br> 
                          Equipa HomePharma`;
                        } else {
                          bodycontent = "";
                        }
                        if (bodycontent != "") {
                          const mailOptions = {
                            FROM: 'homepharmapt@gmail.com',
                            to: usersMail[i].email,
                            subject: 'HomePharma: Resumo diário',
                            html: bodycontent
                          };

                          transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                              erroCronJob = error;
                            }
                          });
                        }
                      }
                      if (erroCronJob == "") {
                        console.log("OK");
                      } else {
                        console.log(erroCronJob)
                      }
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
}).start();

require('custom-env').env('staging');

app.use(validator());
app.use(bodyParser.json({
  limit: '24mb'
}), bodyParser.urlencoded({
  extended: true
}));

app.use(session({
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

require('./routes/auth.route')(app, passport);
require('./routes/main.routes')(app);

app.use(function (request, response, next) {
  response.locals = {
    user: request.user,
    ver: 1.1
  };
  next();
});

app.use('/', require('./controllers/login.controller.js'));
app.use('/mails', require('./controllers/mail.controller.js'));
app.use('/verify', require('./controllers/activation.controller.js'));

app.use('/products', isLoggedIn, require('./controllers/product.controller.js'));
app.use('/images', isLoggedIn, require('./controllers/image.controller.js'));

app.use('/schedulings', isLoggedInUser, require('./controllers/scheduling.controller.js'));
app.use('/spendings', isLoggedInUser, require('./controllers/spending.controller.js'));
app.use('/users', isLoggedInUser, require('./controllers/user.controller.js'));
app.use('/purchases', isLoggedInUser, require('./controllers/purchase.controller.js'));
app.use('/members', isLoggedInUser, require('./controllers/members.controller.js'));
app.use('/dashboard', isLoggedInUser, require('./controllers/dashboard.controller.js'));
app.use('/profile', isLoggedInUser, require('./controllers/profile.controller.js'));

app.use('/administrations', isLoggedInAdmin, require('./controllers/administration.controller.js'));
app.use('/usersBackoffice', isLoggedInAdmin, require('./controllers/userBackoffice.controller.js'));
app.use('/validatedProducts', isLoggedInAdmin, require('./controllers/validatedProduct.controller.js'));
app.use('/productsToValidate', isLoggedInAdmin, require('./controllers/productToValidate.controller.js'));
app.use('/adminProfile', isLoggedInAdmin, require('./controllers/adminProfile.controller.js'));
app.use('/categories', isLoggedInAdmin, require('./controllers/category.controller.js'));
app.use('/productsBackoffice', isLoggedInAdmin, require('./controllers/productBackoffice.controller.js'));
app.use('/pharmaceuticalForms', isLoggedInAdmin, require('./controllers/pharmaceuticalForm.controller.js'));
app.use('/conflicts', isLoggedInAdmin, require('./controllers/conflict.controller.js'));

app.use(express.static(__dirname + '/public', {
  maxAge: 604800000
}));

app.set('view engine', 'ejs');
app.set('views', 'views');

var server = app.listen(port, function () {
  console.log(`worker ${process.pid}`);
  console.log(`Listening at localhost:${port}`);
});


server.timeout = 100000;