'use strict';

require('dotenv').config();
const app = require('express')();
const server = require('http').Server(app);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const watchlist = require('./routes/watchlist.route');
const User = require('./models/user.model');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

passport.use(new LocalStrategy({
  usernameField: 'mail'
}, (mail, password, done) => {
    User.get({ mail: mail }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.set('view engine', 'pug');
app.use('/watchlist', watchlist);

app.get('/', (req, res) => {
  res.render('index', { title: 'Watchlist - Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.post('/register', (req, res) => {
  User.create(req.body.mail, req.body.password);
  res.redirect('/');
});

app.post('/login', passport.authenticate('local', { successRedirect: '/watchlist', 
                                                    failureRedirect: '/',
                                                    failureFlash: true,
                                                    successFlash: 'Welcome!' }));

server.listen(PORT, () => console.log(`Server runs on port: ${PORT}`));