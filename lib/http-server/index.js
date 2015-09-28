var express = require('express')
var ServeIndex = require('gaston-serve-index')
var middleware = require('./middleware')

var HttpServer = module.exports = function (options) {
  var self = this
  self.options = options
  self.listening = false
  self.ip = options.ip
  self.port = options['http-port'] || ++HttpServer.lastPort
  self.connections = []
  self.basePath = options['base-path']
  self.app = express()

  var serveIndexOptions = {
    project: options.name,
    icons: true,
    view: 'details',
    trailingSlashes: true
  }
  var serveIndex = ServeIndex(self.basePath, serveIndexOptions)

  if (!options.name) {
    // self.app.use(middleware.dashboard)
    self.app.use(middleware.addProject)
  } else {
    self.app.use(middleware.application(options))
    self.app.use(middleware.testing(options))
    self.app.use(middleware.bundles)
    self.app.use(middleware.mocha)
  }
  self.app.use(serveIndex)
  self.app.use(middleware.nakedGaston)
  self.app.use(middleware.static(options))
}

HttpServer.lastPort = undefined

HttpServer.prototype.start = function start () {
  var self = this
  return new Promise(function (resolve, reject) {
    // process.on('uncaughtException', onUncaughtExeption.bind(self, resolve))
    self.server = self.app.listen(self.port, onServerStart.bind(self, resolve))
    self.server.on('connection', onConnection.bind(self))
  })
}

// var onUncaughtExeption = function (resolve, ex) {
//   var self = this
//   if (ex.code === 'EADDRINUSE') {
//     self.server = self.app.listen(++self.port, onServerStart.bind(self, resolve))
//   }
// }

var onServerStart = function (resolve) {
  var self = this
  console.log(self.options.name, 'listening on', self.port)
  if (!HttpServer.lastPort) {
    HttpServer.lastPort = self.port
  } else {
    HttpServer.lastPort = self.port > HttpServer.lastPort ? self.port : HttpServer.lastPort
  }
  self.listening = true
  resolve()
}

HttpServer.prototype.stop = function stop () {
  var self = this
  for (var i = 0, l = self.connections.length; i < l; i++) {
    self.connections[i].destroy()
  }
  self.server.close()
  return Promise.resolve()
}

var onConnection = function onConnection (socket) {
  var self = this
  self.connections.push(socket)
  socket.on('close', onSocketClose.bind(self))
}

var onSocketClose = function onSocketClose () {
  var self = this
  self.connections = self.connections.filter(function (socket) {
    return socket !== self
  })
}
