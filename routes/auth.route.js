'use strict';

const router = require('express').Router();
const path = require('path');
const User = require(path.join(__dirname, '../models/user.model'));
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// PASSPORT CONFIG
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

passport.serializeUser( (user, done) => {
  done(null, user._id);
});

passport.deserializeUser( (user, done) => {
  User.get(user, (err, user) => {
    done(err, user);
  });
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.post('/register', (req, res) => {
  User.create(req.body.mail, req.body.password);
  res.redirect('../');
});

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
  successFlash: true }), 
  (req, res) => {
    res.redirect('..' + req.body.url);
  }
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('../');
});

module.exports = router;