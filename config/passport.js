const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//const FacebookStrategy = require('passport-facebook').Strategy;
const req = require("request");
const bCrypt = require("bcryptjs");

/*passport.use(new FacebookStrategy({
        clientID: "",
        clientSecret: "",
        callbackURL: "http://localhost:3050/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
    function (accessToken, refreshToken, profile, done) {
        // TODO: do sth with returned values
        let dataFace = profile._json;
        let options = {
            url: `${urlBaseGo}users`
        }
        req.get(options, (err, res) => {
            if (!err && res.statusCode == 200) {
                const users = JSON.parse(res.body);

                let user = "";
                for (let i = 0; i < users.length; i++) {
                    if (users[i].email == dataFace.email && users[i].tipoLogin == "facebook") {
                        user = users[i];
                    }
                }

                if (user != "") {
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
                    let data = {
                        nomeGrupo: ""
                    };
                    let options = {
                        url: `${urlBaseGo}groups`,
                        body: JSON.stringify(data)
                    }

                    req.post(options, (err, res) => {
                        if (!err && res.statusCode == 200) {
                            let data1 = {
                                idGrupo: JSON.parse(res.body).id,
                                nome: dataFace.name,
                                fotoPessoa: dataFace.picture.data.url,
                                relacao: "Próprio",
                                contacto: {
                                    "Int64": 0,
                                    "Valid": false
                                },
                                genero: "",
                                dataNasc: {
                                    "String": "",
                                    "Valid": false
                                }
                            }
                            let options1 = {
                                url: `${urlBaseGo}people`,
                                body: JSON.stringify(data1)
                            }

                            req.post(options1, (err1, res1) => {
                                if (!err1 && res1.statusCode == 200) {
                                    let data2 = {
                                        idPessoa: JSON.parse(res1.body).id,
                                        email: dataFace.email,
                                        password: "",
                                        tipo: 1,
                                        confirmado: `0`,
                                        estado: 1,
                                        tipoLogin: "facebook"
                                    };

                                    let options2 = {
                                        url: `${urlBaseGo}users`,
                                        body: JSON.stringify(data2)
                                    }

                                    req.post(options2, (err2, res2) => {
                                        if (!err2 && res2.statusCode == 200) {
                                            let userF = {
                                                nomePessoa: data1.nome,
                                                idGrupo: data1.idGrupo,
                                                idUtilizador: JSON.parse(res2.body).id,
                                                email: data2.email,
                                                fotoPessoa: data1.fotoPessoa,
                                                idPessoa: data2.idPessoa,
                                                tipo: "user"
                                            }
                                            return done(null, userF);
                                        } else {
                                            let options3 = {
                                                url: `${urlBaseGo}people/${JSON.parse(res1.body).id}`
                                            }
                                            req.delete(options3, (err3, res3) => {
                                                if (!err3) {
                                                    let options4 = {
                                                        url: `${urlBaseGo}groups/${JSON.parse(res.body).id}`
                                                    }
                                                    req.delete(options4, (err4, res4) => {
                                                        if (!err4) {
                                                            return done(null, false, {
                                                                message: `Coundn't login with facebook`
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    let options2 = {
                                        url: `${urlBaseGo}groups/${JSON.parse(res.body).id}`
                                    }
                                    req.delete(options2, (err2, res2) => {
                                        if (!err2) {
                                            return done(null, false, {
                                                message: `Coundn't login with facebook`
                                            })
                                        }
                                    })
                                }
                            })
                        } else {
                            return done(null, false, {
                                message: `Coundn't login with facebook`
                            })
                        }
                    })
                }
            } else {
                return done(null, false, {
                    message: `user not found`
                })
            }
        })
    }))*/

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
});

const isValidPassword = function (userpass, password) {
    return bCrypt.compareSync(password, userpass);
}

module.exports = passport;