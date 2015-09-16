var package = require('package.json')
  , server = require('./server-info')
  , client = require('../io-client')
  , API = require('..');

var gaston = window.gaston = module.exports = {
  api: API,
  server: server,
  init: function(){
    client.connectedPromise
      .then(function(){
        console.log('connected to gaston');
      })
  }
};

gaston.init();

if( !!window.mocha ){
  require('gaston-tester');
}

console.log(gaston.server)