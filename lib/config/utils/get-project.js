var fs = require('vigour-fs-promised')
var path = require('path')
var backtrackFile = require('../../utils/backtrack-file')

module.exports = function getProject (fullPath) {
  var Config = global.Config
  var pkgPath = backtrackFile('package.json', fullPath)
  if (!pkgPath) {
    return Promise.resolve()
  }

  var projectPath = path.dirname(pkgPath)
  var project = Config.projects[projectPath]
  if (project) {
    return Promise.resolve(project)
  }

  project = {
    basePath: projectPath,
    pkgPath: pkgPath
  }

  return fs.readJSONAsync(pkgPath)
    .then(function (pkg) {
      project.package = pkg
      project.config = pkg.gaston || {}

      var projectFileName = project.basePath.replace(/\//g, '_')
      var writePath = path.join(Config.basePath, 'projects', projectFileName)
      fs.writeJSONAsync(writePath, project, {space: 2, mkdirp: true})
      return project
    })
}
