const passport = require('passport');
const connect = require('./connectBD');
const LocalStrategy = require('passport-local').Strategy;
const bCrypt = require('bcryptjs');
const hubspotController = require('./../controllers/hubspot.controller');

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email'
}, (email, password, done) => {
    connect.query(`SELECT * FROM utilizador WHERE email='${email}'`, async (err, rows, fields) => {
        if (!err) {
            if (rows.length != 0) {
                const user = rows[0];
                if (await isValidPassword(user.password, password)) {
                    if (user.isEmpresa) {
                        let userF = {
                            user_id: user.idUtilizador,
                            email: user.email,
                            nome: user.nome,
                            isEmpresa: true
                        }
                        return done(null, userF);
                    } else {
                        hubspotController.getClient(user.idUtilizador, (res) => {
                            if (res.user) {
                                let userF = {
                                    user_id: user.idUtilizador,
                                    email: user.email,
                                    nome: res.user.nome,
                                    apelido: res.user.apelido,
                                    data_nascimento: res.user.data_nascimento,
                                    numero_telefone: res.user.numero_telefone,
                                    numero_mecanografico: res.user.numero_mecanografico,
                                    nif: res.user.nif,
                                    isEmpresa: false
                                }
                                return done(null, userF);
                            } else {
                                done(null, false, {
                                    'message': `user not found`
                                })
                            }
                        })
                    }
                } else {
                    done(null, false, {
                        'message': `user not found`
                    })
                }
            } else {
                done(null, false, {
                    'message': `user not found`
                })
            }
        } else {
            done(null, false, {
                'message': err.code
            })
        }
    })
}))

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, async (request, email, password, done) => {
    if (password.length >= 9) {
        let validator = {
            maiuscula: 0,
            minuscula: 0,
            numero: 0,
            especial: 0
        }

        for (let i = 0; i < password.length; i++) {
            if ("0123456789".includes(password.charAt(i))) {
                validator.numero = 1;
            } else if ("[`!@#$%^&*()_+-=[]{};':\"\\|,.<>/?~]".includes(password.charAt(i))) {
                validator.especial = 1;
            } else if (password.charAt(i) === password.charAt(i).toLowerCase()) {
                validator.minuscula = 1;
            } else if (password.charAt(i) === password.charAt(i).toUpperCase()) {
                validator.maiuscula = 1;
            }
        }

        if (validator.maiuscula + validator.minuscula + validator.especial + validator.numero < 3) {
            done(null, {
                'statusCode': 400,
                'body': {
                    'message': "Password not valid"
                }
            })
        } else {
            const nome = request.sanitize('nome').escape();
            const apelido = request.sanitize('apelido').escape();
            const numero_mecanografico = request.sanitize('numero_mecanografico').escape();
            const nif = request.sanitize('nif').escape();
            const pass = await bCrypt.hash(password, await bCrypt.genSalt(10));
            connect.query(`SELECT * FROM utilizador WHERE email='${email}'`, (err, rows, fields) => {
                if (!err) {
                    if (rows.length == 0) {
                        hubspotController.existsClientNif(nif, (res) => {
                            if (res.statusCode) {
                                done(null, {
                                    'statusCode': 409,
                                    'body': {
                                        'error': 'NIF_EXISTS'
                                    }
                                });
                            } else {
                                if (!res.exists) {
                                    const properties = [{
                                        property: 'firstname',
                                        value: nome
                                    }, {
                                        property: 'lastname',
                                        value: apelido
                                    }, {
                                        property: 'email',
                                        value: email
                                    }, {
                                        property: "no_mecanografico",
                                        value: numero_mecanografico

                                    }, {
                                        property: 'bilhetes_disponiveis_barquense',
                                        value: 0
                                    }, {
                                        property: 'bilhetes_ida_e_volta_barquense',
                                        value: 0
                                    }, {
                                        property: 'bilhetes_disponiveis_transdev',
                                        value: 0
                                    }, {
                                        property: 'bilhetes_ida_e_volta_transdev',
                                        value: 0
                                    }];
                                    if (nif != '') {
                                        properties.push({
                                            property: 'nif',
                                            value: nif
                                        })
                                    }

                                    hubspotController.createClient(properties, (res) => {
                                        if (res.statusCode == 200) {
                                            const post = {
                                                idUtilizador: res.body.user_id,
                                                email: email,
                                                password: pass,
                                                isEmpresa: false
                                            }

                                            connect.query('INSERT INTO utilizador SET ?', post, (err, rows, fields) => {
                                                if (!err) {
                                                    done(null, {
                                                        'statusCode': 200,
                                                        'body': {
                                                            'message': 'User inserted with success'
                                                        }
                                                    });
                                                } else {
                                                    done(null, {
                                                        'statusCode': 400,
                                                        'body': {
                                                            'message': 'User not create'
                                                        }
                                                    })
                                                }
                                            })
                                        } else {
                                            done(null, res);
                                        }
                                    });
                                } else {
                                    done(null, {
                                        'statusCode': 409,
                                        'body': {
                                            'error': 'NIF_EXISTS'
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        done(null, {
                            'statusCode': 409,
                            'body': {
                                'error': 'CONTACT_EXISTS'
                            }
                        });
                    }
                } else {
                    done(null, {
                        'statusCode': 400,
                        'body': {
                            'message': err.code
                        }
                    })
                }
            });
        }
    } else {
        done(null, {
            'statusCode': 400,
            'body': {
                'message': "Password not valid"
            }
        })
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.user_id);
})

passport.deserializeUser((id, done) => {
    connect.query(`SELECT * FROM utilizador WHERE idUtilizador=${id}`, (err, rows, fields) => {
        if (!err) {
            if (rows.length != 0) {
                const user = rows[0];
                if (user.isEmpresa) {
                    let userF = {
                        user_id: user.idUtilizador,
                        email: user.email,
                        nome: user.nome,
                        isEmpresa: true
                    }
                    return done(null, userF);
                } else {
                    hubspotController.getClient(user.idUtilizador, (res) => {
                        if (res.user) {
                            let userF = {
                                user_id: user.idUtilizador,
                                email: user.email,
                                nome: res.user.nome,
                                apelido: res.user.apelido,
                                data_nascimento: res.user.data_nascimento,
                                numero_telefone: res.user.numero_telefone,
                                numero_mecanografico: res.user.numero_mecanografico,
                                nif: res.user.nif,
                                isEmpresa: false
                            }
                            return done(null, userF);
                        } else {
                            done(null, false, {
                                'message': `user not found`
                            })
                        }
                    })
                }
            } else {
                done(null, false, {
                    'message': `user not found`
                })
            }
        } else {
            done(null, false, {
                'message': err.code
            })
        }
    })

});

const isValidPassword = async function (userpass, password) {
    return await bCrypt.compare(password, userpass);
}

module.exports = passport;