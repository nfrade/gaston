var path = require('path')
var fs = require('vigour-fs-promised')
var _ = require('lodash')
var ip = require('ip')
var HttpServer = require('../../http-server')
var getCurrentBranch = require('../../utils/get-current-branch')

var Project = module.exports = function (pkgPath, options) {
  var project = this
  project.listening = false
  var Config = global.Config
  var basePath = Config.gaston['base-path']
  if (~pkgPath.indexOf(basePath)) {
    project.pkgPath = pkgPath
  } else {
    project.pkgPath = path.join(basePath, pkgPath)
  }
  project['base-path'] = path.dirname(project.pkgPath)
  var regex = new RegExp(path.sep, 'g')
  var projectHash = project['base-path'].replace(regex, '__')
  project.projectFile = path.join(Config.basePath, 'projects', projectHash) + '.json'
}

Project.prototype.update = function () {
  var project = this
  return fs.existsAsync(project.pkgPath)
    .then(function (exists) {
      if (!exists) {
        return project.unregister()
      }
      return fs.readJSONAsync(project.pkgPath)
        .then(function (pkg) {
          project.name = pkg.name
          project.ip = ip.address()
          project.branch = getCurrentBranch(project['base-path'])
          project.pkg = pkg
          return project
        })
    })
}

Project.prototype.save = function () {
  var project = this
  var obj = _.clone(project)
  delete obj.pkg
  delete obj.httpServer
  delete obj.ip
  delete obj.branch
  return fs.writeJSONAsync(project.projectFile, obj, {space: 2, mkdirp: true})
    .then(function () {
      return project
    })
}

Project.prototype.start = function () {
  var project = this
  if (!project.httpServer) {
    project.httpServer = new HttpServer(project)
  }
  return project.httpServer.start()
    .then(function () {
      project.stopped = false
      project['http-port'] = project.httpServer.port
      return project
    })
}

Project.prototype.stop = function () {
  var project = this
  if (!project.httpServer) {
    return Promise.resolve(project)
  }
  return project.httpServer.stop()
    .then(function () {
      project.stopped = true
      return project
    })
}

Project.prototype.unregister = function () {
  var project = this
  var Config = global.Config
  return project.stop()
    .then(function () {
      delete Config.projects[project['base-path']]
      return fs.unlinkAsync(project.projectFile)
    })
}
