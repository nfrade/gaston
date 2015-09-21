var fs = require('vigour-fs-promised')
var path = require('path')
var _ = require('lodash')
var url = require('url')
var mime = require('mime')
var Bundler = require('../../bundler')
var Watcher = require('../watcher')
var errorHandler = require('./error-handler')
var backtrackFile = require('../../utils/backtrack-file')
var replacer = require('./utils/replacer')
var gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
var gastonIndexPath = path.join(gastonFilesPath, 'index.html')
var testPagePath = path.join(gastonFilesPath, 'test.html')

var registry = {}

var Middleware = module.exports = function (options) {
  Middleware.options = options
  Middleware.registry = registry
  var hashRegex = new RegExp(path.sep, 'g')
  var basePath = options['base-path']

  return function (req, res, next) {
    var parsedUrl = url.parse(req.url, true)
    var pathname = parsedUrl.pathname
    var appPath = path.join(basePath, pathname)
    var packagePath = backtrackFile('package.json', appPath)
    var hash = appPath.replace(hashRegex, '_')
    var query = parsedUrl.query
    var action = query.action
    var requestedFile = pathname.split('/').pop()
    var pkg

    if (requestedFile === 'bundle.css' || requestedFile === 'bundle.js') {
      var ext = path.extname(requestedFile).replace('.', '')
      hash = hash.replace(requestedFile, '')
      var app = registry[hash]
      res.set({'Content-Type': mime.lookup(requestedFile)})
      return res.status(200).send(app.bundler.compiled[ext])
    }

    if (!action) {
      return next()
    }

    var fileToCompile = path.join(appPath, query.file)
    appPath = path.dirname(fileToCompile)
    packagePath = backtrackFile('package.json', appPath)

    if (!app) {
      var bundlerOptions = {
        source: fileToCompile,
        gaston: true,
        testing: action === 'test',
        package: packagePath,
        'source-maps': options['source-maps']
      }

      app = registry[hash] = {}
      app.hash = hash
      app.packagePath = packagePath
      pkg = require(packagePath).name
      if (app.packagePath) {
        app.package = require(packagePath)
        app.basePath = path.dirname(packagePath)
        app.name = pkg.name
      }

      var Config = global.Config
      var config = Config.get(app.name)
      bundlerOptions = _.extend(bundlerOptions, config)
      app.bundler = new Bundler(bundlerOptions)
    }

    var titlePath = fileToCompile.substr(fileToCompile.length - 15)
    var title = titlePath + ' - ' + pkg.name
    app.bundler.bundle()
      .then(function (bundle) {
        app.bundler.compiled = bundle
        app.bundler.lastCompiled = new Date()
        Watcher.updateAfterBundle(app.bundler)
        var pagePath = query.action === 'test' ? testPagePath : gastonIndexPath

        if (config['index-path']) {
          pagePath = path.join(app.basePath, config['index-path'])
        }

        fs.createReadStream(pagePath)
          .pipe(replacer({ title: title }))
          .pipe(res)
      })
      .catch(errorHandler(res, title))
  }
}
