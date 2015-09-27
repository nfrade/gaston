var fs = require('vigour-fs-promised')
var path = require('path')
var express = require('express')
var ip = require('ip')
var mime = require('mime')
var ServeIndex = require('gaston-serve-index')
var middleware = require('./middleware')

var HttpServer = module.exports = function (options) {
  var self = this
  self.listening = false
  self.ip = options.ip
  self.port = options['http-port']
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
    self.server = self.app.listen(self.port, function () {
      HttpServer.lastPort = self.port
      self.listening = true
      resolve()
    })
    self.server.on('connection', onConnection.bind(self))
  })
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

var ServerOld = {
  options: undefined,
  ip: undefined,
  port: undefined,
  app: undefined,
  server: undefined,
  basePath: undefined,
  listening: false,
  connections: [],

  start: function () {
    if (Server.listening) {
      var message = 'http server already listening on port ' + Server.port
      return Promise.reject(message)
    }
    var Config = global.Config
    var config = Config.gaston
    Server.options = config
    Server.ip = ip.address()
    Server.port = config['http-port']
    Server.basePath = config['base-path']
    Server.app = express()
    return new Promise(function (resolve, reject) {
      return validateBasePath(Server.basePath)
        .then(function (error) {
          if (error) {
            return reject(error)
          }

          Server.app.use(middleware.application)
          Server.app.use(middleware.bundles)
          Server.app.use(middleware.mocha)

          var serveIndex = ServeIndex(Server.basePath, {
            icons: true,
            view: 'details',
            trailingSlashes: true
          })
          Server.app.use(serveIndex)

          setupRoutes(Server.app, config)

          Server.server = Server.app.listen(Server.port, function () {
            Server.listening = true
            resolve()
          })
          Server.server.on('connection', onConnection)
        })
    })
  },

  stop: function () {
    return new Promise(function (resolve, reject) {
      var connections = Server.connections
      for (var i = 0, l = connections.length; i < l; i++) {
        connections[i].destroy()
      }

      Server.server.close(function () {
        Server.listening = false
        resolve()
      })
    })
  }
}

var validateBasePath = function validateBasePath (basePath) {
  var error
  return fs.existsAsync(basePath)
    .then(function (exists) {
      if (!exists) {
        error = 'base-path does not exist'
        return
      }
      return fs.statAsync(basePath)
    })
    .then(function (stat) {
      if (stat && !stat.isDirectory()) {
        error = 'base-path must be a directory'
      }
      return error
    })
}

var setupRoutes = function setupRoutes (app, options) {
  app.get('*/naked-gaston.js', function (req, res) {
    var gastonPath = path.join(require('os').tmpdir(), 'naked-gaston.js')
    return fs.createReadStream(gastonPath)
      .pipe(res)
  })

  app.get('*', function (req, res) {
    var fullUrl = req.url.split('?').shift()
    var fullPath = path.join(Server.basePath, fullUrl)
    res.set({'Content-Type': mime.lookup(fullPath)})

    fs.existsAsync(fullPath)
      .then(function (exists) {
        if (exists) {
          fs.createReadStream(fullPath).pipe(res)
        } else {
          res.status(404).send('not found')
        }
      })
  })
}
