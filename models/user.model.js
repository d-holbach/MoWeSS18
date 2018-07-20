'use strict';

const crypto = require('crypto');
const nano = require('nano')('http://'+process.env.DB_HOST+':'+process.env.DB_PORT+'');
let userDB = nano.db.use('user');

const options = {
  'saltLen': 128,
  'iterations': 25000,
  'keyLen': 512,
  'digestAlgorithm': 'sha512',
  'encoding': 'hex'
}

nano.db.get('user', function(err, body) {
  if ( err && err.statusCode === 404 ) {
    nano.db.create('user', function(err) {
      if ( !err ) {
        userDB = nano.db.use('user');
      } else {
        throw err;
      }
    });
  } else if ( body === undefined ) {
    throw "Can't connect to CouchDB Server."
  }
});

class User {
  /**
   * @param {string} mail 
   * @param {string} salt 
   * @param {string} hash 
   */
  constructor(mail, salt, hash, iterations, created, updated) {
    this._id = mail;
    this.salt = salt;
    this.hash = hash;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  /**
   * @see {@link https://stackoverflow.com/a/17201493|StackOverflow}
   * @param {string} passwordAttempt
   * @returns {bool}
   */
  validPassword(passwordAttempt) {
    return this.hash == crypto.pbkdf2Sync(passwordAttempt, this.salt, options.iterations, options.keyLen, options.digestAlgorithm).toString(options.encoding);
  }
}

/**
 * @see {@link https://stackoverflow.com/a/17201493|StackOverflow}
 * @param {string} password
 * @returns {Object}
 */
function hashPassword(password) {
  var salt = crypto.randomBytes(options.saltLen).toString(options.encoding);
  var hash = crypto.pbkdf2Sync(password, salt, options.iterations, options.keyLen, options.digestAlgorithm);
  hash = hash.toString(options.encoding);

  return {
      salt: salt,
      hash: hash
  };
}

exports.search = (key, value, done) => {
  nano.request({ db: 'user',
    method: 'post',
    path: '_find',
    body: { 'selector': {
      [key]: value }
    }
  }, (err, body) => {
    if (!err) {
      let user = body.docs[0];
      user = new User(user._id, user.salt, user.hash, user.iterations, user.created, user.updated);
      return done(null, user);
    }
    return done(err, body);
  });
}

exports.get = (mail, done) => {
  userDB.get(mail, (err, body) => {
    if (!err) {
      let user = body;
      user = new User(user._id, user.salt, user.hash, user.iterations, user.created, user.updated);
      return done(null, user);
    }
    return done(err, body);
  });
}

/**
 * @param {string} mail 
 * @param {string} password 
 * @returns {Object}
 */
exports.create = (mail, password) => {
  const crypt = hashPassword(password);
  const newUser = new User(mail, crypt.salt, crypt.hash);

  userDB.insert(newUser, (err, body) => {
    if (!err) {
      return body;
    }
    throw err;
  });
}