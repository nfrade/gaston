var path = require('path')
var fs = require('vigour-fs-promised')
var http = require('http')
var SocketIO = require('socket.io')
var Bundler = require('../bundler')
var HttpServer = require('../http-server')
var registry = {}

var Daemon = module.exports = {
  server: undefined,
  listening: false,
  listener: undefined,
  io: undefined,
  port: undefined,
  connections: [],
  httpServer: undefined,
  start: function () {
    var Config = global.Config
    var config = Config.gaston
    Daemon.port = config['api-port']
    return launchDaemon()
      .then(function () {
        Daemon.httpServer = new HttpServer(config)
        Daemon.httpServer.start()
      })
      // .then(compileNakedGaston)
      .then(function () {
        Daemon.listening = true
      })
  },
  stop: function () {
    return new Promise(function (resolve, reject) {
      return Daemon.httpServer.stop()
        .then(function () {
          Daemon.server.close()
          resolve()
        })
    })
  },
  restart: function () {
    if (!Daemon.listening) {
      return Promise.resolve('not-restarted')
    }
    return Daemon.stop()
      .then(Daemon.start)
  }
}

var launchDaemon = function () {
  return new Promise(function (resolve, reject) {
    var server = Daemon.server = http.createServer()
    var io = Daemon.io = SocketIO(server)
    io.on('connect', onConnection)
    Daemon.listener = server.listen(Daemon.port, resolve)
  })
}

var onConnection = function registerAPI (socket) {
  var keys = Object.keys(registry)
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i]
    var callback = registry[key].bind(socket)
    socket.on(key, callback)
  }
}

var registryPath = path.join(__dirname, 'registry')
fs.readdirAsync(registryPath)
  .then(function (files) {
    for (var i = 0, l = files.length; i < l; i++) {
      var file = files[i]
      if (path.extname(file) !== '.js') {
        return
      }
      var evName = file.replace('.js', '')
      var reqPath = path.join(registryPath, file)
      registry[ evName ] = require(reqPath)
    }
  })

var compileNakedGaston = function compileNakedGaston () {
  return new Promise(function (resolve, reject) {
    var gastonPath = path.join(__dirname, '..', 'bundler/dummys', 'index.js')
    var bundleOptions = {
      source: gastonPath,
      gaston: true,
      naked: true
    }
    var bundler = new Bundler(bundleOptions)
    return bundler.bundle()
      .then(function (bundle) {
        var gastonPath = path.join(require('os').tmpdir(), 'naked-gaston.js')
        return fs.writeFileAsync(gastonPath, bundle.js, 'utf8')
      })
      .then(resolve)
      .catch(reject)
  })
}
