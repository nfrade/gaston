"use strict";

var path = require('path')

module.exports = function onChange (Watcher) {
  return function onChange (file) {
    if (~file.indexOf('package.json')) {
      var Config = global.Config
      var projectPath = path.dirname(file)
      var project = Config.projects[projectPath]

      var appKeys = Object.keys(Config.apps)
      for (let i = 0, l = appKeys.length; i < l; i++) {
        let appKey = appKeys[i]
        let app = Config.apps[appKey]
        if (app && app.project === project) {
          Config.apps[appKey] = null
        }
      }
      return project.update()
        .then(function (project) {
          var io = require('../../../daemon').io
          io.emit('reload')
        })
    } else {
      var io = require('../../../daemon').io
      io.emit('reload')
    }
  }
}
