'use strict';

const router = require('express').Router();
const path = require('path');
const User = require(path.join(__dirname, '../models/user.model'));
const passport = require('passport');

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

router.post('/login', passport.authenticate('local', { successRedirect: '/watchlist', 
                                                    failureRedirect: '/',
                                                    failureFlash: true,
                                                    successFlash: true })
                                                  );

module.exports = router;