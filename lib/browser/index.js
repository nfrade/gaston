var package = require('package.json')
  , server = require('./server-info')
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
        gaston.client = client;
        require('./listeners');
        console.info('connected to gaston - ip:', server.ip, 'port:', server.port);
        require('index.js')
      })
  },
  identify: function(action, file){
    var rex = /GastonID=(\w+-\w+-\w+-\d+)/;
    var search = window.location.search;
    var match = rex.exec(window.location.search);
    if(!match){
      var ua = gaston.ua;
      var id = ua.platform + '-' + ua.device + '-' + ua.browser;
      id += '-' +  Math.floor(Math.random()* 999);

      var queryString = (search.length === 0? '?' : '&') + 'GastonID=' + id;
      queryString += '&file=' + (file || 'index.js');
      queryString += '&action=' + action;

      window.location.href = window.location.href + queryString;
    } else {
      gaston.id = match[1];
    }
  }
};

gaston.init();

if( !!window.mocha ){
  require('gaston-tester');
}
