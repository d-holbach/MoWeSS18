'use strict';

const router = require('express').Router();
const shortid = require('shortid');
const bodyParser = require('body-parser');
const path = require('path');
const Watchlist = require(path.join(__dirname, '../models/watchlist.model'));
const omdb = require(path.join(__dirname, '../interfaces/omdb.interface'));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  if (req.user) {
    Watchlist.listByUser(req.user._id, (err, list) => {
      if (!err) {
        res.render('watchlist/index', { title: `Watchlist - Dashboard`, list: list }, (err, html) => {
          res.send(html);
        });
      }
    });
  } else res.redirect('../');
});

router.get('/:id', (req, res) => {
  if (req.user) {
    const id = req.params.id;

    if (!shortid.isValid(id)) {
      res.status(400).send('Bad Request');
    }
    
    Watchlist.get(id, (err, body) => {
      if (err && body.statusCode === 404) {
        res.render('404', { title: '404 - Not found' });
      } else {
        body.title = 'Watchlist - ' + body.name;
        body.created = new Date(body.created).toUTCString()
        res.render('watchlist/watchlist', body);
      }
    });
  } else res.redirect('../auth/login');
});

router.post('/:id', (req, res) => {
  if (req.user) {
    const id = req.params.id;

    if (!shortid.isValid(id)) {
      res.status(400).send('Bad Request');
    }
    
    Watchlist.get(id, (data) => {
      if (data.statusCode === 404) {
        res.render('404', { title: '404 - Not found' });
      } else {
        const movie = omdb.get(req.body.movieID);
        data.addMovie(movie.name, movie.year, movie.img);
        Watchlist.update(data, (err, body) => {
          if (!err) {
            body.title = 'Watchlist - ' + body.name;
            body.created = new Date(body.created).toUTCString();
            res.render('watchlist/watchlist', body);
          }
        })
      }
    });
  } else res.redirect('../auth/login');
});

router.post('/:id/movies/', (req, res) => {
  if (req.body.mode === 'search') {
    omdb.search(req.body.title, (err, result) => {
      if (!err) {
        res.json(result.Search);
      } else {
        console.log('ERROR: /:id/movies/', err);
      }
    });
  } else if (req.body.mode === 'add') {
    omdb.get(req.body.id).then(results => {
      res.json(results);
    })
    .catch((err) => {
      res.json(err);
    })
  } else {
    res.status(400).send('Bad Request');
  }
});

router.post('/', (req, res) => {
  if (req.user) {
    const id = shortid.generate();
    Watchlist.create(id, req.body.name, req.user._id);
    res.render('watchlist/created', { title: `Watchlist with ${id} created`, id: id })
  } else res.redirect('../auth/login');
});

module.exports = router;