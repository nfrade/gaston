var path = require('path')
var Watcher = require('./watcher')
var Project = require('./models/project')
var homedir = process.env.USERPROFILE || process.env.HOME

var Config = module.exports = global.Config = {
  gaston: undefined,
  projects: {},
  apps: {},
  basePath: path.join(homedir, '.gaston'),
  current: undefined,
  init: function (noWatcher) {
    Config.projectsPath = path.join(Config.basePath, 'projects')
    if(noWatcher){
      return Promise.resolve()
    }
    return Watcher.init()
  },
  registerProject: function (pkgPath, fromCLI) {
    var project = new Project(pkgPath)

    if (!fromCLI && Config.projects[project['base-path']]) {
      return Config.projects[project['base-path']]
        .update()
    }
    Config.projects[project['base-path']] = project
    if (!fromCLI) {
      return project.update()
        .then(function (p) {
          return p.start()
        })
        .then(function (p) {
          return p.save()
        })
    } else {
      return project.update()
    }
  },
  startProject: function (obj) {
    return Config.getProject(obj)
      .then(function (project) {
        return project.start()
      })
  },
  getProject: function (obj) {
    var project = new Project(obj.pkgPath)
    project['http-port'] = obj['http-port']
    project.stopped = obj.stopped
    return project.update()
  }
}
