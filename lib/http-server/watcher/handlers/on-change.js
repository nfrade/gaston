var path = require('path')

module.exports = function onChange (Watcher) {
  return function onChange (file) {
    if (~file.indexOf('package.json')) {
      var Config = global.Config
      var projectPath = path.dirname(file)
      var project = Config.projects[projectPath]

      var appKeys = Object.keys(Config.apps)
      for (var i = 0, l = appKeys.length; i < l; i++) {
        var appKey = appKeys[i]
        var app = Config.apps[appKey]
        if (app.project === project) {
          Config.apps[appKey] = null
        }
      }
      return Config.registerProject.registerCurrent(project)
        .then(function () {
          var io = require('../../../daemon').io
          io.emit('reload')
        })
    } else {
      var io = require('../../../daemon').io
      io.emit('reload')
    }
  }
}
