"use strict";

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
      .then(compileNakedGaston)
      .then(function () {
        Daemon.listening = true
        return registerProjects()
      })
      .then(function () {})
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

var registerProjects = function () {
  var Config = global.Config
  var projects = Config.projects
  var keys = Object.keys(projects)
  var promises = []
  for (let i = 0, l = keys.length; i < l; i++) {
    let key = keys[i]
    let promise = Config.getProject(Config.projects[key])
      .then(function (project) {
        if (project && !project.stopped) {
          return project.start()
        }
        return project
      })
    promises.push(promise)
  }
  return Promise.all(promises)
    .then(function (projects) {
      for (let i = 0, l = projects.length; i < l; i++) {
        let project = projects[i]
        Config.projects[project['base-path']] = project
      }
    })
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
  for (let i = 0, l = keys.length; i < l; i++) {
    let key = keys[i]
    let callback = registry[key].bind(socket)
    socket.on(key, callback)
  }
}

var registryPath = path.join(__dirname, 'registry')
fs.readdirAsync(registryPath)
  .then(function (files) {
    for (let i = 0, l = files.length; i < l; i++) {
      let file = files[i]
      if (path.extname(file) !== '.js') {
        return
      }
      let evName = file.replace('.js', '')
      let reqPath = path.join(registryPath, file)
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
    return bundler.bundle(true)
      .then(function (bundle) {
        var gastonPath = path.join(require('os').tmpdir(), 'naked-gaston.js')
        return fs.writeFileAsync(gastonPath, bundle.js, 'utf8')
      })
      .then(resolve)
      .catch(reject)
  })
}
