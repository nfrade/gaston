var log = require('npmlog')
var fs = require('vigour-fs-promised')
var path = require('path')
var ip = require('ip')
var chokidar = require('chokidar')
var daemon = require('../../daemon')
var ignoreRegex = /((?!\.json$)(\..{1,10}))$/

module.exports = {
  init: function () {
    var Config = global.Config
    return new Promise(function (resolve, reject) {
      var options = { ignores: ignoreRegex }
      var watcher = chokidar.watch(Config.basePath, options)
      watcher
        .on('change', onChange)
        .on('add', function (file) {
          return onChange(file)
            .then(function () {
              if (isGastonFile(file)) {
                resolve()
              }
            })
        })
    })
  }
}

var onChange = function (file) {
  var Config = global.Config
  if (path.extname(file) !== '.json') {
    return Promise.resolve()
  }
  return fs.readJSONAsync(file)
    .then(function (obj) {
      if (isGastonFile(file)) {
        Config.gaston = obj
        Config.gaston.ip = ip.address()
        return
      }
      if (isProjectFile(file)) {
        return registerProject(file)
      }
    })
    .then(daemon.restart)
    .then(function (ignore) {
      if (!ignore) {
        log.info('gaston', 'daemon restarted with the new settings')
      }
    })
}

var isGastonFile = function (file) {
  var Config = global.Config
  var isBase = (path.dirname(file) === Config.basePath)
  return isBase && path.basename(file === 'gaston.json')
}

var isProjectFile = function (file) {
  var Config = global.Config
  var projectsPath = path.join(Config.projectsPath)
  return ~file.indexOf(projectsPath)
}

var registerProject = function (file) {
  var Config = global.Config
  fs.readJSONAsync(file)
    .then(function (project) {
      var projectName = project.basePath.replace(/\_\g/, '/')
      Config.projects[projectName] = project
    })
}
