module.exports = function (app, passport) {
    app.get('/logout', (request, response, err) => {
        request.session.destroy(function (err) {
            if (err) {
                response.status(400).send({
                    'message': 'You cannot logout!'
                });
            }
            response.status(200).send({
                'message': 'Logout with success'
            });
        });
    });
    app.post('/login', (request, response, next) => {
        passport.authenticate('local-signin', (err, user, info) => {
            if (err) {
                return response.status(400).json({
                    'message': err
                })
            }
            if (user) {
                request.login(user, (err) => {
                    return response.status(200).send(request.user);
                })
            } else {
                return response.status(400).json(info);
            }
        })(request, response, next);
    });

    app.post('/register', (request, response, next) => {
        passport.authenticate('local-signup', (err, info) => {
            if (err) {
                return response.status(400).json({
                    'message': err
                })
            }
            return response.status(info.statusCode).send(info.body);
        })(request, response, next);
    });
};