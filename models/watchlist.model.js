'use strict';

const nano = require('nano')('http://'+process.env.DB_HOST+':'+process.env.DB_PORT+'');
let watchlist = nano.db.use('watchlist');

nano.db.get('watchlist', function(err, body) {
  if ( err && err.statusCode === 404 ) {
    nano.db.create('watchlist', function(err) {
      if ( !err ) {
        watchlist = nano.db.use('watchlist');
      } else {
        throw err;
      }
    });
  } else if ( body === undefined ) {
    throw "CouchDB Server isn't running."
  }
});

exports.get = (id, done) => {
  watchlist.get(id, (err, body) => {
    if (!err) {
      return done(body);
    }
    return done(err);
  });
}

exports.create = (id, name) => {
  let newWatchlist = {};
  newWatchlist.name = name;
  newWatchlist.movies = [];

  watchlist.insert(newWatchlist, id, (err, body) => {
    if (!err) {
      return body;
    }
    throw err;
  });
}