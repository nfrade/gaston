var fs = require('vigour-fs-promised')
var path = require('path')
var chokidar = require('chokidar')
var onChangeHandler = require('./handlers/on-change')
var onUnlinkHandler = require('./handlers/on-unlink')

var Watcher = module.exports = {
  files: [],
  watchers: [],
  map: {},

  addWatcher: function addWatcher (file, app) {
    var files = Watcher.files
    if (!~files.indexOf(file)) {
      Watcher.files.push(file)
      var watcher = chokidar.watch(file)
      watcher.on('change', onChangeHandler(Watcher))
      watcher.on('unlink', onUnlinkHandler(Watcher))
      Watcher.watchers.push(watcher)
    }
  },

  removeWatcher: function removeWatcher (watcher) {
    var watchers = Watcher.watchers
    watchers = watchers.filter(function (item) {
      return item !== watcher
    })
    watcher.close()
  },

  updateApp: function updateApp (app) {
    var files = app.bundle.files

    for (var i = 0, l = files.length; i < l; i++) {
      var file = files[i]
      if (file === 'index.js') {
        file = app.source
      }
      if (file === 'package.json') {
        file = path.join(app.project['base-path'], 'package.json')
      }
      if (!file) {
        return
      }
      (function (file) {
        if (typeof file !== 'string') {
          return
        }
        fs.existsAsync(file)
          .then(function (exists) {
            var ignore = !exists
            ignore = ignore || ~file.indexOf('/gaston/lib/')
            ignore = ignore || ~file.indexOf('/gaston/node_modules/')
            if (!ignore) {
              Watcher.addWatcher(file, app)
            }
          })
      })(file)
    }
  }
}
