var fs = require('vigour-fs-promised')
var path = require('path')
var express = require('express')
var ip = require('ip')
var mime = require('mime')
var ServeIndex = require('gaston-serve-index')
var middleware = require('./middleware')
var mochaMiddleWare = require('./middleware/mocha')

var Server = module.exports = {
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

var onConnection = function onConnection (socket) {
  Server.connections.push(socket)
  socket.on('close', onSocketClose)
}

var onSocketClose = function onSocketClose () {
  var self = this
  Server.connections = Server.connections.filter(function (socket) {
    return socket !== self
  })
}
