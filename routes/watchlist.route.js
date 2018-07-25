'use strict';

const router = require('express').Router();
const shortid = require('shortid');
const bodyParser = require('body-parser');
const path = require('path');
const Watchlist = require(path.join(__dirname, '../models/watchlist.model'));
const omdb = require(path.join(__dirname, '../interfaces/omdb.interface'));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use('/:id', (req, res, next) => {
  const id = req.params.id;

  if (shortid.isValid(id)) {
    req.id = id;
    next();
  } else {
    res.status(400).send('Bad Request');
  }
})

router.use('/:id/movies/:mid', (req, res, next) => {
  const reg = RegExp(/^tt\d{6,}/, 'g');
  const movieID = req.params.mid;

  if (reg.test(movieID)) {
    req.movieID = movieID;
    next();
  } else {
    res.status(400).send('Bad Request');
  }
})


router.get('/', (req, res) => {
  Watchlist.listByUser(req.user._id, (err, list) => {
    if (!err) {
      if (list === undefined || list.length == 0) list = null;
      res.render('watchlist/index', { title: `Watchlist - Dashboard`, list: list }, (err, html) => {
        res.send(html);
      });
    } else console.error('GET / - Watchlist.listByUser:', err);
  });
});

router.post('/', (req, res) => {
  const id = shortid.generate();
  Watchlist.create(id, req.body.name, req.user._id);
  res.render('watchlist/created', { title: `Watchlist with ${id} created`, id: id })
});

router.get('/:id', (req, res) => {
  Watchlist.get(req.id, (err, body) => {
    if (err && err.statusCode === 404) {
      res.render('404', { title: '404 - Not found' });
    } else {
      body.title = 'Watchlist - ' + body.name;
      if (body.movies === undefined || body.movies.length == 0) body.movies = null;
      body.createdOutput = new Date(body.created).toUTCString()
      res.render('watchlist/watchlist', body);
    }
  });
});

router.delete('/:id', (req, res) => {
  Watchlist.get(req.id, (err, watchlist) => {
    if (!err) {
      Watchlist.delete(req.id, watchlist._rev, (err, body) => {
        if (!err) {
          res.status(202).send('Deleted');
        } else console.error('DELETE /:id - Watchlist.delete:', err);
      });
    } else console.error('DELETE /:id - Watchlist.get:', err);
  });
});

router.post('/:id/movies/', (req, res) => {
  omdb.search(req.body.title, (err, result) => {
    if (!err) {
      res.json(result.Search);
    } else console.error('POST /:id/movies/ - omdb.search:', err);
  });
});

router.post('/:id/movies/:mid/', (req, res) => {
  omdb.get(req.movieID, (err, result) => {
    if (!err) {
      Watchlist.get(req.id, (err, watchlist) => {
        if (!err) {

          const newMovie = {
            id: result.imdbID,
            title: result.Title,
            year: result.Year,
            genre: result. Genre,
            director: result.Director,
            plot: result.Plot,
            runtime: result.Runtime,
            rating: result.imdbRating,
            poster: result.Poster
          }

          watchlist.movies.push(newMovie);

          Watchlist.update(watchlist, (err, body) => {
            if (!err) {
              res.status(201).json(newMovie);
            } else console.error('POST /:id/movies/:mid/ - Watchlist.update:', err);
          });
        } else console.error('POST /:id/movies/:mid/ - Watchlist.get:', err);
      }); 
    } else console.error('POST /:id/movies/:mid/ - omdb.get:', err);
  });
});

router.delete('/:id/movies/:mid/', (req, res) => {
  Watchlist.get(req.id, (err, watchlist) => {
    if (!err) {
      watchlist.movies = watchlist.movies.filter(movie => req.movieID !== movie.id);

      Watchlist.update(watchlist, (err, body) => {
        if (!err) {
          res.status(202).json(body);
        } else console.error('DELETE /:id/movies/:mid/ - Watchlist.update:', err);
      });
    } else console.error('DELETE /:id/movies/:mid/ - Watchlist.get:', err);
  });
});

module.exports = router;