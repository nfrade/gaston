var fs = require('vigour-fs-promised')
var path = require('path')
var HttpServer = require('../../http-server')
var getCurrentBranch = require('../../utils/get-current-branch')

module.exports = function (pkgPath, disposable) {
  var Config = global.Config
  pkgPath = path.join(Config.gaston['base-path'], pkgPath)

  var projectPath = path.dirname(pkgPath)
  var project = Config.projects[projectPath]
  if (project) {
    return registerCurrent(project, pkgPath)
  }

  project = {
    'base-path': projectPath
  }

  if (disposable) {
    return registerCurrent(project, pkgPath)
  }

  Config.projects[projectPath] = project

  var httpServer = new HttpServer(project)
  return httpServer.start()
    .then(function () {
      project['http-port'] = httpServer.port
      var regex = new RegExp(path.sep, 'g')
      var projectHash = projectPath.replace(regex, '__')
      var projectFile = path.join(Config.basePath, 'projects', projectHash)
      return fs.writeJSONAsync(projectFile, project, {space: 2, mkdirp: true})
    })
    .then(function () {
      project.ip = Config.gaston.ip
      return registerCurrent(project, pkgPath)
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
