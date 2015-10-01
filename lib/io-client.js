var io = require('socket.io-client')

var Client = module.exports = {
  socket: undefined,
  connectedPromise: undefined,
  connect: function (server) {
    if (server) {
      return connect(server)
    } else {
      if (global && global.Config) {
        var Config = global.Config
        return Config.init()
          .then(connect)
      }
    }
    var gaston = window.gaston
    return connect(gaston.server)
  }
}

var connect = function (server) {
  var Config = global ? global.Config : {}
  var gaston = window && window.gaston
  var ip = server ? server.ip : (gaston && gaston.server.ip) || Config.gaston.ip
  var port = server ? server.port : (gaston && gaston.server.port) || Config.gaston['api-port']
  return new Promise(function (resolve, reject) {
    Client.socket = io('http://' + ip + ':' + port)
    Client.socket.on('connect', function () {
      resolve(Client.socket)
    })
    Client.socket.on('connect_error', reject)
  })
}
