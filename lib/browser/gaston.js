var io = require('socket.io-client')
  , path = require('path')

var xhr = new XMLHttpRequest();
xhr.open('GET', '/socket-port');
xhr.onload = function(){
  gaston.PORT = parseInt(this.responseText, 10);
  gaston.init();
}
xhr.send();

var gaston = window.gaston = module.exports = {
  init: function(){
    gaston.socket = io('http://localhost:' + gaston.PORT);
    gaston.socket.on('connect', function(){
      console.log('successfully connected to socket-server on port', gaston.PORT);  
    });
    gaston.socket.on('connect_error', function(err){
      console.log('error connecting to socket server', err);  
    });
    gaston.autoreload = require('./autoreload');
  },
  
  on: function(ev, handler){
    gaston.socket.on(ev, handler);
  },
  emit: function(message, payload){
    gaston.socket.emit(message, payload);
  },
  //api
  build: require('./build')
};

