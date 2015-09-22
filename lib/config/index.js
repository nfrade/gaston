var fs = require('vigour-fs-promised')
var path = require('path')
var ip = require('ip')
var _ = require('lodash')
var Watcher = require('./watcher')
var Middleware = require('../http-server/middleware')
var homedir = process.env.USERPROFILE || process.env.HOME

var Config = module.exports = global.Config = {
  configs: {},
  path: path.join(homedir, '.gaston', 'config.json'),
  current: undefined,
  init: function () {
    return Watcher.init(Config.path)
  },
  get: function (projectName) {
    var project
    var projectConfig
    if (projectName) {
      project = Middleware.projects[projectName]
      var pkgStr = fs.readFileSync(project.packagePath, 'utf8')
      var pkg = JSON.parse(pkgStr)
      projectConfig = pkg.gaston
      delete projectConfig['http-port']
      delete projectConfig['api-port']
      delete projectConfig['base-path']
    }

    var config = _.extend(Config.configs.gaston, projectConfig)
    config.ip = ip.address()
    return config
  }
}
