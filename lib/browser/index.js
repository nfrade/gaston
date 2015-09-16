var package = require('package.json')
  , server = require('./server-info')
  , client = require('../io-client');

var gaston = window.gaston = module.exports = {
  // api: API,
  server: server,
  init: function(){
    client.connect(gaston.server)
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