var fs = require('vigour-fs-promised')
var path = require('path')
var _ = require('lodash')
var glob = require('glob')
var url = require('url')
var Bundler = require('../../bundler')
var Watcher = require('../watcher')
var errorHandler = require('./error-handler')
var replacer = require('./utils/replacer')
var gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
var gastonIndexPath = path.join(gastonFilesPath, 'test.html')

module.exports = function (project) {
  return function (req, res, next) {
    var Config = global.Config
    var headers = req.headers

    var parsedUrl = url.parse(req.url, true)
    var query = parsedUrl.query

    if (query.$action !== 'test') {
      return next()
    }

    var appName = headers.host + query.$file

    var app = Config.apps[appName]
    if (!app) {
      var source = path.join(project['base-path'], query.$file)

      return fs.statAsync(source)
        .then(function (stat) {
          var filter = source
          if (stat.isDirectory()) {
            filter = path.join(source, '**/*.js')
          }
          return new Promise(function (resolve, reject) {
            glob(filter, function (err, files) {
              if (err) {
                return reject(err)
              }
              return resolve(files)
            })
          })
        })
        .then(function (files) {
          app = Config.apps[appName] = {
            title: project.pkg.name,
            name: appName,
            project: project,
            source: files,
            testing: true,
            gaston: _.merge({}, Config.gaston, project.pkg.gaston)
          }

          app.bundler = new Bundler(app)
          return compile(app, res)
        })
    }
    return compile(app, res)
  }
}

var compile = function (app, res) {
  app.bundler.bundleTest(true)
    .then(function (bundle) {
      app.bundle = bundle
      Watcher.updateApp(app)
      return getIndexHTML(app)
    })
    .then(function (app) {
      app.indexStream.pipe(res)
    })
    .catch(function (err) {
      app.res = res
      errorHandler(err, app)
    })
}

var getIndexHTML = function (app) {
  var indexPath = gastonIndexPath
  // app.title = app.basePath.substr(app.basePath.length - 15)
  app.indexStream = fs.createReadStream(indexPath)
    .pipe(replacer({
      title: app.title + '-' + app.name,
      '$bundle.css': 'bundle.css?$app=' + app.name,
      '$bundle.js': 'bundle.js?$app=' + app.name
    }))
  return app
}
