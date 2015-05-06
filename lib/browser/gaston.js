var io = require('socket.io-client');

var gaston = window.gaston = module.exports = {
  socket: io('http://localhost:8081'),
  on: function(ev, handler){
    gaston.socket.on(ev, handler);
  },
  emit: function(message, payload){
    gaston.socket.emit(message, payload);
  },
  //api
  build: require('./build')
};

//listening
gaston.autoreload = require('./autoreload');
