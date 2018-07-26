'use strict';

const dotenv = require('dotenv').config();

if (dotenv.error) {
  throw dotenv.error
}

const express = require('express');
const app = express();
const session = require('express-session');
const server = require('http').Server(app);
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');
const compression = require('compression');
const watchlist = require(path.join(__dirname, 'routes/watchlist.route'));
const auth = require(path.join(__dirname, 'routes/auth.route'));

const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.use(session({ 
  secret: 'mowe18',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', auth);
app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    if (req.headers.accept.match(/(text\/html|application\/xhtml\+xml)/) !== null) res.status(401).render('auth/login', { title: 'Login', reqUrl: req.url, mainClass: 'login' });
    else if (req.headers.accept.match(/application\/json/) !== null) res.status(401).json( { message: 'Unauthorized' } );
    else res.status(401).send('Unauthorized');
  }
});

app.use('/watchlist', watchlist);
app.use(compression());

// INDEX
app.get('/', (req, res) => {
  res.render('index', { title: 'Watchlist' }, (err, html) => {
    res.send(html);
  });
});

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Not found' });
});

server.listen(PORT, () => console.log(`Server runs on port: ${PORT}`));