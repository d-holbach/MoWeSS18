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

    this.movies.push(movie);
  }

  save() {

  }
}

exports.get = (id, done) => {
  watchlistDB.get(id, (err, body) => {
    if (!err) {
      return done(body);
    }
    return done(err);
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