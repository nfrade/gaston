var path = require('path')
var Watcher = require('./watcher')
var registerProject = require('./utils/register-project')
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
  registerProject: registerProject
}
