var io = require('socket.io-client')
  , socket = io('http://localhost:8081');

var autoreload = module.exports = function(){
  window.location.reload();
}

socket.on('reload', autoreload);