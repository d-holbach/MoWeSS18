'use strict';

require('dotenv').config();
const app = require('express')();
const session = require('express-session');
const server = require('http').Server(app);
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const watchlist = require(path.join(__dirname, 'routes/watchlist.route'));
const auth = require(path.join(__dirname, 'routes/auth.route'));
const User = require(path.join(__dirname, 'models/user.model'));

const PORT = process.env.PORT || 3000;

passport.use(new LocalStrategy({
  usernameField: 'mail'
}, (mail, password, done) => {
    User.get(mail, (err, user) => {
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

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(user, done) {
  User.get(user._id, function(err, user) {
    done(err, user);
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ 
  secret: 'mowe18',
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'pug');
app.use('/auth', auth);
app.use('/watchlist', watchlist);

app.get('/', (req, res) => {
  if (req.user) {
    res.render('index', { title: 'Watchlist' }, (err, html) => {
      res.send(html);
    });
  } else res.redirect('/auth/login');
});



server.listen(PORT, () => console.log(`Server runs on port: ${PORT}`));