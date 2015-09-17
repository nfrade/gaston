var server = require('./server-info')
  , client = require('../io-client')
  , API = require('..')
  , UA = require('./user-agent');

var gaston = window.gaston = module.exports = {
  client,
  api: API,
  ua: UA,
  server: server,
  init: function(){
    client.connectedPromise
      .then(function(){
        console.info('connected to gaston - ip:', server.ip, 'port:', server.port);
        gaston.client = client;
        require('./listeners');
        require('index.js')
      })
  },
  identify: function(action, file){
    var ua = gaston.ua;
    var id = ua.platform + '-' + ua.device + '-' + ua.browser;
    id += '-' +  Math.floor(Math.random()* 999);
    var queryString = 'GastonID=' + id;
    queryString += '&file=' + (file || 'index.js');
    queryString += '&action=' + action;
    window.location.search = queryString;
  }
};

gaston.init();

if( !!window.mocha ){
  require('gaston-tester');
}
