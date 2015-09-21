var log = require('npmlog')
var fs = require('vigour-fs-promised')
var chokidar = require('chokidar')
var daemon = require('../../daemon')
var ignoreRegex = /((?!\.json$)(\..{1,10}))$/

module.exports = {
  init: function (configPath) {
    return new Promise(function (resolve, reject) {
      var options = { ignored: ignoreRegex }
      var watcher = chokidar.watch(configPath, options)
      watcher
        .on('change', onChange)
        .on('add', function (file) {
          return onChange(file)
            .then(resolve)
        })
    })
  }
}

var onChange = function (file) {
  return fs.readJSONAsync(file)
    .then(function (obj) {
      var Config = global.Config
      Config.configs['gaston'] = obj
    })
    .then(daemon.restart)
    .then(function (ignore) {
      if (!ignore) {
        log.info('gaston', 'daemon restarted with the new settings')
      }
    })
}
