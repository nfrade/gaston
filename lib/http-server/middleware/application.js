var fs = require('vigour-fs-promised')
var path = require('path')
var _ = require('lodash')
var url = require('url')
var Bundler = require('../../bundler')
var errorHandler = require('./error-handler')
var replacer = require('./utils/replacer')
var gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
var gastonIndexPath = path.join(gastonFilesPath, 'index.html')

module.exports = function (project) {
  return function (req, res, next) {
    var Config = global.Config
    var headers = req.headers

    var parsedUrl = url.parse(req.url, true)
    var query = parsedUrl.query

    if (query.$action !== 'dev') {
      return next()
    }

    var appName = headers.host + query.$file
    console.log('appName', appName)

    var app = Config.apps[appName]
    if (!app) {
      var fileToCompile = path.join(project['base-path'], query.$file)
      app = Config.apps[appName] = {
        title: project.pkg.name,
        name: appName,
        project: project,
        source: fileToCompile,
        gaston: _.merge(Config.gaston, project.pkg.gaston)
      }
      app.bundler = new Bundler(app)
    }

    app.bundler.bundle(true)
      .then(function (bundle) {
        app.bundle = bundle
        return getIndexHTML(app)
      })
      .then(function (app) {
        app.indexStream.pipe(res)
      })
  }
}

var getIndexHTML = function (app) {
  var indexPath = gastonIndexPath
  if (app.gaston['index-path']) {
    indexPath = app.gaston['index-path']
    if (!path.isAbsolute(indexPath)) {
      indexPath = path.join(app.project['base-path'], indexPath)
    }
  }

  // app.title = app.basePath.substr(app.basePath.length - 15)
  app.indexStream = fs.createReadStream(indexPath)
    .pipe(replacer({
      title: app.title + '-' + app.name,
      '$bundle.css': 'bundle.css?$app=' + app.name,
      '$bundle.js': 'bundle.js?$app=' + app.name
    }))
  return app
}

var compile = function compile (app) {
  app.bundler = app.bundler || new Bundler(app.options)
  return app.bundler.bundle()
// .then(function (bundle) {
//   app.bundle = bundle
//   return app
// })
}
// return
// var pathname = parsedUrl.pathname
// var fullPath = path.join(basePath, pathname)
// var projectPath = getProjectPath(fullPath)
// var packagePath = path.join(projectPath, 'package.json')
// var app = findApp(apps, fullPath, basePath)
// var requestedFile = pathname.split('/').pop()
// var project
// var isTesting

// if (requestedFile === 'bundle.css' || requestedFile === 'bundle.js') {
//   var ext = path.extname(requestedFile).replace('.', '')
//   res.set({'Content-Type': mime.lookup(requestedFile)})
//   return res.status(200).send(app.bundler.compiled[ext])
// }

// if (!query.action) {
//   return next()
// }

// isTesting = query.action === 'test'

// try {
//   pkg = require(packagePath)
// } catch (ex) {
//   throw Error('package.json not found in ' + projectPath)
// }

// project = Middleware.projects[pkg.name]
// if (!project) {
//   project = Middleware.projects[pkg.name] = {}
//   project.name = pkg.name
//   project.basePath = projectPath
//   project.packagePath = packagePath
//   project.config = Config.get(pkg.name)
//   project.currentBranch = getCurrentBranch(project.basePath)
// }

// if (!app) {
//   var fileToCompile = path.join(fullPath, query.file)
//   var titlePath = fileToCompile.substr(fileToCompile.length - 15)
//   app = Middleware.apps[fullPath] = {
//     isTesting: isTesting,
//     title: titlePath + ' - ' + project.name,
//     name: project.name,
//     options: {
//       project: project,
//       source: fileToCompile,
//       gaston: true,
//       testing: isTesting,
//       package: project.packagePath,
//       'source-maps': project.config['source-maps'],
//       'transforms': project.config.transforms
//     }
//   }
//   app.bundler = new Bundler(app.options)
// }

// app.bundler.bundle()
//   .then(function (bundle) {
//     app.bundler.compiled = bundle
//     app.bundler.lastCompiled = new Date()
//     Watcher.updateAfterBundle(app.bundler)
//     var pagePath = isTesting ? testPagePath : gastonIndexPath

//     if (!isTesting && config['index-path']) {
//       pagePath = path.join(project.basePath, config['index-path'])
//     }

//     fs.createReadStream(pagePath)
//       .pipe(replacer({ title: app.title }))
//       .pipe(res)
//   })
//   .catch(errorHandler(res, app.title))

// return

// var appPath = path.join(basePath, pathname)
// var packagePath = backtrackFile('package.json', appPath)
// var hash = appPath.replace(hashRegex, '_')
// var pkg

// console.log(pathname)

// var fileToCompile = path.join(appPath, query.file)
// appPath = path.dirname(fileToCompile)
// packagePath = backtrackFile('package.json', appPath)

// if (!app) {
//   var bundlerOptions = {
//     source: fileToCompile,
//     gaston: true,
//     testing: action === 'test',
//     package: packagePath,
//     'source-maps': config['source-maps']
//   }

//   app = registry[hash] = {}
//   app.hash = hash
//   app.packagePath = packagePath
//   pkg = require(packagePath).name
//   if (app.packagePath) {
//     app.package = require(packagePath)
//     app.basePath = path.dirname(packagePath)
//     app.name = pkg.name
//   }

//   config = Config.get(app.name)
//   bundlerOptions = _.extend(bundlerOptions, config)
//   app.bundler = new Bundler(bundlerOptions)
// }

// var titlePath = fileToCompile.substr(fileToCompile.length - 15)
// var title = titlePath + ' - ' + pkg.name
// app.bundler.bundle()
//   .then(function (bundle) {
//     app.bundler.compiled = bundle
//     app.bundler.lastCompiled = new Date()
//     Watcher.updateAfterBundle(app.bundler)
//     var pagePath = query.action === 'test' ? testPagePath : gastonIndexPath

//     if (config['index-path']) {
//       pagePath = path.join(app.basePath, config['index-path'])
//     }

//     fs.createReadStream(pagePath)
//       .pipe(replacer({ title: title }))
//       .pipe(res)
//   })
//   .catch(errorHandler(res, title))
