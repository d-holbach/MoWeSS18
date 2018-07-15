'use strict';

const router = require('express').Router();
const shortid = require('shortid');
const bodyParser = require('body-parser');
const Watchlist = require('../models/watchlist.model');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  res.render('watchlist/index', { title: `Watchlist - Dashboard`})
});

router.get('/:id', (req, res) => {
  let id = req.params.id;

  if (!shortid.isValid(id)) {
    res.status(400).send('Bad Request');
  }
  
  Watchlist.get(id, (data) => {
    console.log(data);
    if (data.statusCode === 404) {
      res.render('404', { title: '404 - Not found' });
    } else {
      data.title = 'Watchlist - ' + data.name;
      res.render('watchlist/watchlist', data);
    }
  });
});

router.post('/', (req, res) => {
  const id = shortid.generate();
  Watchlist.create(id, req.body.name);
  res.render('watchlist/created', { title: `Watchlist with ${id} created`, id: id })
});

module.exports = router;