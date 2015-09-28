var daemon = require('../')

module.exports = function info (options) {
  var socket = this
  var httpServer = daemon.httpServer
  socket.emit('info-complete', {
    'ip': httpServer.ip,
    'api-port': daemon.port,
    'http-port': httpServer.port,
    'base-path': httpServer.basePath,
    'home': 'http://' + httpServer.ip + ':' + httpServer.port + '/'
  })
}
