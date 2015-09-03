var httpServer = require('../../http-server');

var stop = module.exports = function stop(options){
  var socket = this;
  return httpServer.stop()
    .then(function(){
      socket.emit('stopped', httpServer);
    });
};