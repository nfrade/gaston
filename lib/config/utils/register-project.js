var fs = require('vigour-fs-promised')
var path = require('path')
var _ = require('lodash')
var HttpServer = require('../../http-server')
var getCurrentBranch = require('../../utils/get-current-branch')
var startProject = require('./start-project')

module.exports = function (pkgPath, disposable) {
  var Config = global.Config
  pkgPath = path.join(Config.gaston['base-path'], pkgPath)

  var projectPath = path.dirname(pkgPath)
  var project = Config.projects[projectPath]
  if (project) {
    return registerCurrent(project)
  }

  project = {
    'base-path': projectPath
  }

  if (disposable) {
    return registerCurrent(project)
  }

  Config.projects[projectPath] = project

  project['http-port'] = HttpServer.lastPort + 1
  return registerCurrent(project)
    .then(startProject)
    .then(function () {
      project['http-port'] = project.httpServer.port
      project.ip = Config.gaston.ip
      return project
    })
    .then(function () {
      var regex = new RegExp(path.sep, 'g')
      var projectHash = projectPath.replace(regex, '__')
      var projectFile = path.join(Config.basePath, 'projects', projectHash) + '.json'
      var obj = _.clone(project)
      delete obj.pkg
      delete obj.httpServer
      console.log(obj)
      return fs.writeJSONAsync(projectFile, obj, {space: 2, mkdirp: true})
        .then(function () {
          return project
        })
    })
}

var registerCurrent = module.exports.registerCurrent = function (project) {
  var pkgPath = path.join(project['base-path'], 'package.json')
  return fs.readJSONAsync(pkgPath)
    .then(function (pkg) {
      project.name = pkg.name
      project.branch = getCurrentBranch(project['base-path'])
      project.pkg = pkg
      return project
    })
}
