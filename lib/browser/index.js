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
  },
  identify: function(action, file){
    // var ua = require('./user-agent');
    // gaston.set('ua', ua);
    var rex = /GastonID=(\w+-\w+-\w+-\d+)/;
    var search = window.location.search;
    var match = rex.exec(window.location.search);
    if(!match){
      // var ua = gaston.config.ua;
      // id = ua.platform + '-' + ua.device + '-' + ua.browser;
      id = '-' +  Math.floor(Math.random()* 999);
      // gaston.set('$id', id);

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

console.log(gaston.server)