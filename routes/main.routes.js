module.exports = (app) => {
    app.get('/authrequired', (req, res) => {
        if (req.isAuthenticated()) {
            res.send('you hit the authentication endpoint\n')
        } else {
            res.redirect('/');
        }
    })
}