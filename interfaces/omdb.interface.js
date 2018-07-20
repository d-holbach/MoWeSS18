'use strict';

const rp = require('request-promise-native');

const options = {
  'key': process.env.OMDB_API_KEY,
  'url': 'http://www.omdbapi.com/',
}

exports.search = (name, done) => {
  name = encodeURIComponent(name);
  rp(options.url + '?apikey=' + options.key + '&s=' + name)
    .then( (result) => {
      done(null, JSON.parse(result)); 
    })
    .catch( (err) => {
      done(err, null)
    });
}