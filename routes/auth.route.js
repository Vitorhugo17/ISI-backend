module.exports = function (app, passport) {
    app.get('/logout', (req, res, err) => {
        req.session.destroy(function (err) {
            if (err) {
                console.log(err);
                res.status(400).send({
                    message: "You cannot logout!"
                });
            }
            notAuthorized = false;
            res.status(200).send({
                message: "Logout with success"
            });
        });
    });
    app.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(400).json({
                    message: err
                })
            }
            if (user) {
                req.login(user, (err) => {
                    return res.status(200).send(req.user);
                })
            }
            return res.status(400).json(info);
        })(req, res, next);
    })
    app.get('/auth/facebook',
        passport.authenticate('facebook', { scope: ['email'] }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook',{
            failureRedirect: '/'
        }),
        function (req, res) {
            // Successful authentication, redirect home.
            console.log(req.user)
            res.redirect('/dashboard');
        }
    );
};