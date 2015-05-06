var io = require('socket.io-client')
  , path = require('path')

var xhr = new XMLHttpRequest();
xhr.open('GET', '/socket-port');
xhr.onload = function(){
  gaston.init( JSON.parse(this.responseText) );
}
xhr.send();

var gaston = window.gaston = module.exports = {
  init: function(server){
    var serverAddress = 'http://' + server.ip + ':' + server.port;
    gaston.socket = io(serverAddress);
    gaston.socket.on('connect', function(){
      console.info('successfully connected to socket-server on ', serverAddress);
    });
    gaston.socket.on('connect_error', function(err){
      console.log('error connecting to socket server', serverAddress);
      console.error(err);  
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

