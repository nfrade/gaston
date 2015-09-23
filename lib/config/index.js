var fs = require('vigour-fs-promised')
var path = require('path')
var ip = require('ip')
var _ = require('lodash')
var Watcher = require('./watcher')
var Middleware = require('../http-server/middleware')
var homedir = process.env.USERPROFILE || process.env.HOME

var Config = module.exports = global.Config = {
  gaston: undefined,
  projects: {},
  apps: {},
  basePath: path.join(homedir, '.gaston'),
  current: undefined,
  init: function () {
    Config.projectsPath = path.join(Config.basePath, 'projects')
    Config.appsPath = path.join(Config.basePath, 'apps')
    return Watcher.init(Config.path)
  },
  get: function (projectName) {
    var project
    var projectConfig
    if (projectName) {
      project = Middleware.projects[projectName]
      var pkgStr = fs.readFileSync(project.packagePath, 'utf8')
      var pkg = JSON.parse(pkgStr)
      projectConfig = pkg.gaston || {}
      delete projectConfig['http-port']
      delete projectConfig['api-port']
      delete projectConfig['base-path']
    }
    return config
  }
}
