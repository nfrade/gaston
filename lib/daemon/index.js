"use strict";

var path = require('path')
var fs = require('vigour-fs-promised')
var http = require('http')
var SocketIO = require('socket.io')
var Bundler = require('../bundler')
var HttpServer = require('../http-server')
var registry = {}
var ncp = require('ncp');

var Daemon = module.exports = {
  server: undefined,
  listening: false,
  listener: undefined,
  io: undefined,
  port: undefined,
  connections: [],
  httpServer: undefined,
  start: function (port) {
    var Config = global.Config
    var config = Config.gaston
    Daemon.port = port || config['api-port']
    config['api-port'] = Daemon.port
    return launchDaemon(port)
      .then(function () {
        if(port){
          return
        }
        Daemon.httpServer = new HttpServer(config)
        return Daemon.httpServer.start()
        .then(compileNakedGaston)
        .then(compileDashboard)
        .then(function () {
          Daemon.listening = true
          return registerProjects()
        })
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

var launchDaemon = function (port) {
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

var compileDashboard = function compileDashboard() {
  return new Promise(function (resolve, reject) {
    var dashboardPath = path.join(__dirname, '..', 'http-server/middleware/dashboard')
    var bundleOptions = {
      source: path.join(dashboardPath, 'index.js'),
      gaston: true,
      naked: true
    }

    var bundler = new Bundler(bundleOptions)
    return bundler.bundle(true)
      .then(function (bundle) {
        var tmpdir = require('os').tmpdir()
        var tmpPath = path.join(tmpdir, 'gaston-dashboard')
        var indexPath = path.join(dashboardPath, 'index.html')

        if (!fs.existsSync(tmpPath)) {
          fs.mkdirSync(tmpPath)
        }

        return fs.writeFileAsync(path.join(tmpPath, 'bundle.js'), bundle.js, 'utf8')
          .then(() => fs.writeFileAsync(path.join(tmpPath, 'bundle.css'), bundle.css, 'utf8'))
          .then(() => fs.readFileAsync(indexPath, 'utf8')
            .then((data) => {
              data = data.replace('bundle.js', 'gaston-dashboard/bundle.js')
              data = data.replace('bundle.css', 'gaston-dashboard/bundle.css')
              return fs.writeFileAsync(path.join(tmpPath, 'index.html'), data, 'utf8')
            }))
          .then(() => ncp(path.join(dashboardPath, 'assets'), path.join(tmpPath, 'assets')))
      })
      .then(resolve)
      .catch(reject)
  })
}
