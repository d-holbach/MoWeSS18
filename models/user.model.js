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
  constructor(mail, salt, hash, iterations) {
    this.mail = mail;
    this.salt = salt;
    this.hash = hash;
    this.iterations = iterations;
    this.created = new Date().toISOString();
    this.updated = new Date().toISOString();
  }

  /**
   * @see {@link https://stackoverflow.com/a/17201493|StackOverflow}
   * @param {string} passwordAttempt
   * @returns {bool}
   */
  isPasswordCorrect(passwordAttempt) {
    return this.hash == crypto.pbkdf2Sync(passwordAttempt, this.salt, this.iterations, 64, 'sha512');
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

// exports.search = (key, value, done) => {
//   nano.request({ db: 'user',
//     method: 'get',
    
//   }, (err, body) => {
//     console.log('err', err);
//     console.log('body', body);
//     if (!err) {
//       return done(null, body);
//     }
//     return done(err, body);
//   });
// }

exports.create = (mail, password) => {
  const crypt = hashPassword(password);
  const newUser = new User(mail, crypt.salt, crypt.hash, crypt.iterations);

  user.insert(newUser, (err, body) => {
    if (!err) {
      return body;
    }
    throw err;
  });
}