var fs = require('vigour-fs-promised')
var path = require('path')
var HttpServer = require('../../http-server')
var getCurrentBranch = require('../../utils/get-current-branch')

module.exports = function (pkgPath) {
  var Config = global.Config
  pkgPath = path.join(Config.gaston['base-path'], pkgPath)
  var projectPath = path.dirname(pkgPath)
  var project = Config.projects[projectPath]
  if (project) {
    return registerCurrent(project, pkgPath)
  }

  project = {
    isProject: true,
    ip: Config.gaston.ip,
    'base-path': projectPath,
    'http-port': ++HttpServer.lastPort
  }

  return registerCurrent(project, pkgPath)
    .then(function (project) {
      var httpServer = new HttpServer(project)
      return httpServer.start()
    })
    .then(function () {
      return project
    })
}

var registerCurrent = function (project, pkgPath) {
  return fs.readJSONAsync(pkgPath)
    .then(function (pkg) {
      project.name = pkg.name
      project.pkg = pkg
      project.branch = getCurrentBranch(project['base-path'])
      return project
    })
}
