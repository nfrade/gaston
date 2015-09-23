// var fs = require('vigour-fs-promised')
var path = require('path')
// var _ = require('lodash')
var url = require('url')
// var mime = require('mime')
// var Bundler = require('../../bundler')
// var Watcher = require('../watcher')
// var errorHandler = require('./error-handler')
// var backtrackFile = require('../../utils/backtrack-file')
// var getCurrentBranch = require('../../utils/get-current-branch')
// var replacer = require('./utils/replacer')
// var findApp = require('./utils/find-app')
// var gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
// var gastonIndexPath = path.join(gastonFilesPath, 'index.html')
// var testPagePath = path.join(gastonFilesPath, 'test.html')

// [TODO] serve testing directly,  serve static files correctly


module.exports = function (req, res, next) {
  var Config = global.Config
  var parsedUrl = url.parse(req.url, true)
  var query = parsedUrl.query
  var fileToCompile = query.$file
  // console.log(parsedUrl)

  if (!query.$action) {
    return next()
  }

  Config.get(fileToCompile)
    .then(function (app) {
      // console.log('Middleware - app', app)
      // res.write('yay, got the app<br><br>')
      res.send(app.project.package.name)
    })
    .catch(function (err) {
      res.send(err)
    })

  return
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
}
