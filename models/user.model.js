'use strict';

const crypto = require('crypto');
const nano = require('nano')('http://'+process.env.DB_HOST+':'+process.env.DB_PORT+'');
let user = nano.db.use('user');

nano.db.get('user', function(err, body) {
  if ( err && err.statusCode === 404 ) {
    nano.db.create('user', function(err) {
      if ( !err ) {
        user = nano.db.use('user');
      } else {
        throw err;
      }
    });
  } else if ( body === undefined ) {
    throw "CouchDB Server isn't running."
  }
});

class User {
  /**
   * @param {string} mail 
   * @param {string} salt 
   * @param {string} hash 
   * @param {number} iterations 
   */
  constructor(mail, salt, hash, iterations, created, updated) {
    this.mail = mail;
    this.salt = salt;
    this.hash = hash;
    this.iterations = iterations;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  /**
   * @see {@link https://stackoverflow.com/a/17201493|StackOverflow}
   * @param {string} passwordAttempt
   * @returns {bool}
   */
  validPassword(passwordAttempt) {
    console.log("crypto", crypto.pbkdf2Sync(passwordAttempt, this.salt, this.iterations, 64, 'sha512').toString('hex'))
    return this.hash == crypto.pbkdf2Sync(passwordAttempt, this.salt, this.iterations, 64, 'sha512').toString('hex');
  }
}

/**
 * @see {@link https://stackoverflow.com/a/17201493|StackOverflow}
 * @param {string} password
 * @returns {Object}
 */
function hashPassword(password) {
  var salt = crypto.randomBytes(128).toString('base64');
  var iterations = 10000;
  var hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');

  return {
      salt: salt,
      hash: hash,
      iterations: iterations
  };
}

exports.search = (key, value, done) => {
  console.log('key', key);
  console.log('value', value);
  nano.request({ db: 'user',
    method: 'post',
    path: '_find',
    body: { 'selector': {
      [key]: value }
    }
  }, (err, body) => {
    console.log('err', err);
    console.log('body', body);
    if (!err) {
      let user = body.docs[0];
      user = new User(user.mail, user.salt, user.hash, user.iterations, user.created, user.updated);
      return done(null, user);
    }
    return done(err, body);
  });
}

exports.create = (mail, password) => {
  const crypt = hashPassword(password);
  const newUser = new User(mail, crypt.salt, crypt.hash.toString('hex'), crypt.iterations);

  user.insert(newUser, (err, body) => {
    if (!err) {
      return body;
    }
    throw err;
  });
}