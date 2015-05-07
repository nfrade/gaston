var io = require('socket.io-client');

var server = {
  ip: '{{socketServer.ip}}',
  port: '{{socketServer.port}}'
};

var gaston = window.gaston = module.exports = {
  init: function(){
    var serverAddress = 'http://' + server.ip + ':' + server.port;
    gaston.socket = io(serverAddress);
    gaston.socket.on('connect', function(){
      console.info('successfully connected to socket-server on ', serverAddress);
    });
    gaston.socket.on('connect_error', function(err){
      console.log('error connecting to socket server', serverAddress);
      console.error(err);  
    });
    setAPI();
  },
  
  on: function(ev, handler){
    gaston.socket.on(ev, handler);
  },
  emit: function(message, payload){
    gaston.socket.emit(message, payload);
  }
};

var setAPI = function(){
  gaston.autoReload = require('./autoreload'),
  gaston.build = require('./build')
}


gaston.init();