'use strict';

const nano = require('nano')('http://'+process.env.DB_HOST+':'+process.env.DB_PORT+'');
let watchlistDB = nano.db.use('watchlist');

nano.db.get('watchlist', function(err, body) {
  if ( err && err.statusCode === 404 ) {
    nano.db.create('watchlist', function(err) {
      if ( !err ) {
        watchlistDB = nano.db.use('watchlist');
      } else {
        throw err;
      }
    });
  } else if ( body === undefined ) {
    throw "CouchDB Server isn't running."
  }
});

class Watchlist {
  constructor(id, name, movies, created, updated) {
    this._id = id;
    this.name = name || "";
    this.movies = movies || [];
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  addMovie(title, year, img, seen) {
    let movie = {};
    movie.title = title;
    movie.year = year;
    movie.img = img;
    movie.seen = seen || false;
    this.updated = new Date().toISOString();
    this.movies.push(movie);
  }
}

exports.get = (id, done) => {
  watchlistDB.get(id, (err, body) => {
    if (!err) {
      const watchlist = new Watchlist(body._id, body.name, body.movies, body.created, body.updated);
      return done(null, watchlist);
    }
    return done(err, body);
  });
}

exports.update = (watchlist, done) => {
  nano.request({
    db: 'watchlist',
    method: 'PUT',
    path: watchlist._id,
    body: watchlist
  }, (err, body) => {
    if (!err) {
      return done(null, body);
    }
    return done(err, body)
  });
}

exports.create = (id, name) => {
  let newWatchlist = new Watchlist(id, name);

  watchlistDB.insert(newWatchlist, (err, body) => {
    if (!err) {
      return body;
    }
    throw err;
  });
}