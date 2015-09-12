var httpServer = require('../../http-server')
  , daemon = require('../../daemon');

var info = module.exports = function info(options){
  var socket = this;
  socket.emit('info-complete', {
    'ip': httpServer.ip,
    'api-port': daemon.port,
    'http-port': httpServer.port,
    'base-path': httpServer.basePath,
    'home': 'http://'+ httpServer.ip + ':' + httpServer.port + '/'
  });
};