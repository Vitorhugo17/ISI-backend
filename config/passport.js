const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
/*const bCrypt = require("bcryptjs");

passport.use(new LocalStrategy({
    usernameField: 'email'
}, (email, password, done) => {
    let options = {
        url: `${urlBaseGo}users`
    }
    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            const users = JSON.parse(res.body);
            let user = "";
            for (let i = 0; i < users.length; i++) {
                if (users[i].email == email && users[i].tipoLogin == "local") {
                    user = users[i];
                }
            }

            if (user != "") {
                if (isValidPassword(user.password, password)) {
                    if (user.confirmado == "0") {
                        let options1 = {
                            url: `${urlBaseGo}people/${user.idPessoa}`
                        }
                        req.get(options1, (err1, res1) => {
                            if (!err1 && res1.statusCode == 200) {
                                let person = JSON.parse(res1.body)[0];
                                let userF = {
                                    nomePessoa: person.nome,
                                    idGrupo: person.idGrupo,
                                    idUtilizador: user.idUtilizador,
                                    email: user.email,
                                    fotoPessoa: person.fotoPessoa,
                                    idPessoa: user.idPessoa
                                }
                                if (user.tipo == 1) {
                                    userF.tipo = "user";
                                } else {
                                    userF.tipo = "admin";
                                }
                                return done(null, userF);
                            } else {
                                return done(null, false, {
                                    message: `user not found`
                                })
                            }
                        })
                    } else {
                        return done(null, false, {
                            message: "Activate your account"
                        })
                    }
                } else {
                    return done(null, false, {
                        message: "Incorrect Password"
                    })
                }

            } else {
                return done(null, false, {
                    message: "Incorrect email"
                })
            }
        } else {
            return done(null, false, {
                message: `user not found`
            })
        }
    })
}))

passport.serializeUser((user, done) => {
    done(null, user.idUtilizador);
})

passport.deserializeUser((id, done) => {
    let options = {
        url: `${urlBaseGo}users/${id}`
    }

    req.get(options, (err, res) => {
        if (!err && res.statusCode == 200) {
            const user = JSON.parse(res.body)[0];

            let options1 = {
                url: `${urlBaseGo}people/${user.idPessoa}`
            }

            req.get(options1, (err1, res1) => {
                if (!err1 && res1.statusCode == 200) {
                    let person = JSON.parse(res1.body)[0];
                    let userF = {
                        nomePessoa: person.nome,
                        idGrupo: person.idGrupo,
                        idUtilizador: user.idUtilizador,
                        email: user.email,
                        fotoPessoa: person.fotoPessoa,
                        idPessoa: user.idPessoa
                    }
                    if (user.tipo == 1) {
                        userF.tipo = "user";
                    } else {
                        userF.tipo = "admin";
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
    })
});*/

const isValidPassword = function (userpass, password) {
    return bCrypt.compareSync(password, userpass);
}

module.exports = passport;