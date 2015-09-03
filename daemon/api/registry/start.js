var httpServer = require('../../http-server');

var start = module.exports = function(options){
  var socket = this;
  return httpServer.start(options)
    .then(function(){
      socket.emit('started', httpServer);
    });
};