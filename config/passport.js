const passport = require('passport');
const connect = require('./connectBD');
const LocalStrategy = require('passport-local').Strategy;
const bCrypt = require("bcryptjs");
const hubspotController = require('./../controllers/hubspot.controller');

passport.use(new LocalStrategy({
    usernameField: 'email'
}, (email, password, done) => {
    connect.query(`SELECT * FROM utilizador WHERE email="${email}"`, (err, rows, fields) => {
        if (!err) {
            if (rows.length != 0) {
                const user = rows[0];
                if (isValidPassword(user.password, password)) {
                    hubspotController.getClient(user.idUtilizador, (res) => {
                        if (res.user) {
                            let userF = {
                                user_id: user.idUtilizador,
                                email: user.email,
                                nome: res.user.nome + " " + res.user.apelido,
                                data_nascimento: res.user.data_nascimento,
                                numero_telefone: res.user.numero_telefone,
                                numero_mecanografico: res.user.numero_mecanografico,
                                nif: res.user.nif
                            }
                            return done(null, userF);
                        } else {
                            done(null, false, {
                                message: `user not found`
                            })
                        }
                    })
                } else {
                    done(null, false, {
                        message: `password invalid`
                    })
                }
            } else {
                done(null, false, {
                    message: `user not found`
                })
            }
        } else {
            done(null, false, {
                message: err.message
            })
        }
    })
}))

passport.serializeUser((user, done) => {
    done(null, user.user_id);
})

passport.deserializeUser((id, done) => {
    connect.query(`SELECT * FROM utilizador WHERE idUtilizador=${id}`, (err, rows, fields) => {
        if (!err) {
            if (rows.length != 0) {
                const user = rows[0];
                hubspotController.getClient(user.idUtilizador, (res) => {
                    if (res.user) {
                        let userF = {
                            user_id: user.idUtilizador,
                            email: user.email,
                            nome: res.user.nome + " " + res.user.apelido,
                            data_nascimento: res.user.data_nascimento,
                            numero_telefone: res.user.numero_telefone,
                            numero_mecanografico: res.user.numero_mecanografico,
                            nif: res.user.nif
                        }
                        return done(null, userF);
                    } else {
                        done(null, false, {
                            message: `user not found`
                        })
                    }
                })
            } else {
                done(null, false, {
                    message: `user not found`
                })
            }
        } else {
            done(null, false, {
                message: err.message
            })
        }
    })

});

const isValidPassword = function (userpass, password) {
    return bCrypt.compareSync(password, userpass);
}

module.exports = passport;