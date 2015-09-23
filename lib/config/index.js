var path = require('path')
var Watcher = require('./watcher')
var getProject = require('./utils/get-project')
var getApp = require('./utils/get-app')
var homedir = process.env.USERPROFILE || process.env.HOME

var Config = module.exports = global.Config = {
  gaston: undefined,
  projects: {},
  basePath: path.join(homedir, '.gaston'),
  current: undefined,
  init: function () {
    Config.projectsPath = path.join(Config.basePath, 'projects')
    Config.appsPath = path.join(Config.basePath, 'apps')
    return Watcher.init(Config.path)
  },
  get: function (jsPath) {
    var appName = path.join(Config.gaston['base-path'], jsPath)
    return getProject(appName)
      .then(function (project) {
        if (!project) {
          throw Error('no package.json found')
        }
        Config.projects[project.basePath] = project
        return getApp(appName, project)
      })
  }
}
