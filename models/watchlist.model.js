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
    throw "Can't connect to CouchDB Server."
  }
});

class Watchlist {
  constructor(id, name, user, movies, created, updated) {
    this._id = id;
    this.name = name || "";
    this.user = user;
    this.movies = movies || [];
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }
}

exports.get = (id, done) => {
  watchlistDB.get(id, (err, body) => {
    if (!err) {
      return done(null, body);
    }
    return done(err, body);
  });
}

exports.listByUser = (user, done) => {
  nano.request({
    db: 'watchlist',
    method: 'post',
    path: '_find',
    body: { 'selector': {
      'user': user }
    }
  }, (err, body) => {
    if (!err) {
      return done(null, body.docs);
    }
    return done(err, body);
  });
}


exports.update = (watchlist, done) => {
  watchlist.updated = new Date().toISOString()

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

exports.create = (id, name, user) => {
  let newWatchlist = new Watchlist(id, name, user);

  watchlistDB.insert(newWatchlist, (err, body) => {
    if (!err) {
      return body;
    }
    throw err;
  });
}

exports.delete = (id, rev, done) => {
  nano.request({
    db: 'watchlist',
    method: 'DELETE',
    path: id,
    qs: { rev: rev }
  }, (err, body) => {
    if (!err) {
      return done(null, body);
    }
    return done(err, body)
  });
}