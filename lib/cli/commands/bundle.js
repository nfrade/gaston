var log = require('npmlog')
var fs = require('vigour-fs-promised')
var path = require('path')
var _ = require('lodash')
var Bundler = require('../../bundler')
var backtrackFile = require('../../utils/backtrack-file')

module.exports = function bundle (args) {
  var Config = global.Config
  var cwd = process.cwd()
  var source = args.s || args.source
  if (!source) {
    throw Error('you have to specify a source file')
  }
  if (source && source.indexOf('/') !== 0 && !~source.indexOf(cwd)) {
    source = path.join(cwd, source)
  }

  var pkgPath = backtrackFile('package.json', source)
  pkgPath = pkgPath.replace(Config.gaston['base-path'], '')

  var output = args.o || args.output
  if (output && output.indexOf('/') !== 0 && !~output.indexOf(cwd)) {
    output = path.join(cwd, output)
  }

  var app

  return Config.registerProject(pkgPath)
    .then(function (project) {
      app = {
        title: project.pkg.name,
        project: project,
        source: source,
        gaston: _.merge({}, Config.gaston, project.pkg.gaston)
      }
      return app
    })
    .then(function (app) {
      var bundler = new Bundler(app)
      return bundler.bundle()
    })
    .then(function (bundle) {
      if (!output) {
        return exit(0)
      }

      var withIndex = args.i || args.index

      return fs.statAsync(output)
        .then(function (stat) {
          if (!stat.isDirectory()) {
            return exit(1, 'output must be a directory')
          }

          var promises = [
            fs.writeFileAsync(path.join(output, 'bundle.js'), bundle.js, 'utf8'),
            fs.writeFileAsync(path.join(output, 'bundle.css'), bundle.css, 'utf8')
          ]

          if (withIndex) {
            var indexPath = app.gaston['index-path']
            if (!indexPath) {
              indexPath = path.join(__dirname, '../../../', 'gaston-files', 'index.html')
            } else {
              if (!path.isAbsolute(indexPath)) {
                indexPath = path.join(app.project['base-path'], indexPath)
              }
            }
            var rs = fs.createReadStream(indexPath)
            var ws = fs.createWriteStream(path.join(output, 'index.html'))
            rs.pipe(ws)
          }

          return Promise.all(promises)
            .then(function () {
              exit(0)
            })
            .catch(function (err) {
              exit(1, err.message)
            })
        })
        .catch(function (err) {
          return exit(1, "output directory doesn't exist", err)
        })
    })
}

var exit = function (code, message) {
  if (code) {
    return log.error('gaston', message)
  }
  log.info('gaston', 'bundle completed successfully')
  process.exit(code)
}
