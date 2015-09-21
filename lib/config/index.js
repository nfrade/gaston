var fs = require('vigour-fs-promised')
var path = require('path')
var ip = require('ip')
var _ = require('lodash')
var Watcher = require('./watcher')
var homedir = process.env.USERPROFILE || process.env.HOME

var Config = module.exports = global.Config = {
  configs: {},
  path: path.join(homedir, '.gaston', 'config.json'),
  current: undefined,
  init: function () {
    return Watcher.init(Config.path)
  },
  get: function (project) {
    var packagePath
    var projectConfig = {}
    var registry = require('../http-server/middleware').registry

    if (registry) {
      var registryKeys = Object.keys(registry)
      for (var i = 0, l = registryKeys.length; i < l; i++) {
        var key = registryKeys[i]
        if (registry[key].name === project) {
          packagePath = registry[key].packagePath
          break
        }
      }
    }

    if (packagePath) {
      if (fs.existsSync(packagePath)) {
        var pkg = fs.readFileSync(packagePath, 'utf8')
        pkg = JSON.parse(pkg)
        projectConfig = projectConfig = pkg.gaston || {}
      }
    }

    var config = _.extend(Config.configs.gaston, projectConfig)
    config.ip = ip.address()
    return config
  }
}
