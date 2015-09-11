var httpServer = require('../../http-server')
  , daemon = require('../../daemon');

var info = module.exports = function info(options){
  var socket = this;
  socket.emit('info-complete', {
    ip: httpServer.ip,
    port: httpServer.port,
    daemon: daemon.port
  });
};