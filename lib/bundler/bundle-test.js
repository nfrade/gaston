var fs = require('vigour-fs-promised')
var path = require('path')
var browserify = require('browserify')
var watchify = require('watchify')
var babelify = require('./transforms/babelify')
var glob = require('glob')
var Blessify = require('gaston-blessify')
var Smapify = require('gaston-smapify')
var setAlias = require('./util/set-alias')
var applyTransforms = require('./util/apply-transforms')
var tmpdir = require('os').tmpdir()

module.exports = function bundle (runGaston) {
  // var Config = global.Config
  var self = this
  var app = self.app || {}
  app.gaston = app.gaston || {}
  var project = app.project

  if (self.watchify) {
    return new Promise(function (resolve, reject) {
      var onComplete = onBundleComplete(self.blessify, resolve, reject, self)
      var bundle = self.watchify.bundle(onComplete)
      bundle.on('data', self.smapify.buildMap)
    })
  }

  return new Promise(function (resolve, reject) {
    var bOptions = {
      debug: app.gaston['source-maps'],
      cache: {},
      packageCache: {},
      fullPaths: true,
      noParse: []
    }

    var b
    fs.statAsync(app.source)
      .then(function (stat) {
        if (stat.isDirectory()) {
          return app.source + '**/*.js'
        } else {
          return app.source
        }
      })
      .then(function (filter) {
        return new Promise(function (resolve, reject) {
          glob(filter, function (err, files) {
            if (err) {
              return reject(err)
            }
            resolve(files)
          })
        })
      })
      .then(function (files) {
        if (files.length === 1) {
          return files[0]
        }
        var requiresList = ''
        for (var i = 0, l = files.length; i < l; i++) {
          requiresList += "require('" + files[i] + "')\n"
        }
        var regex = new RegExp(path.sep, 'g')
        var requiresFile = path.join(tmpdir, app.source.replace(regex, '__'))
        return fs.writeFileAsync(requiresFile, requiresList, 'utf8')
          .then(function () {
            return requiresFile
          })
      })
      .then(function (requiresFile) {
        if (runGaston) {
          var gastonPath = path.join(__dirname, '..', 'browser', 'index.js')
          b = browserify(gastonPath, bOptions)
          b.require(requiresFile, { expose: 'index.js' })
          var testerPath = path.join(__dirname, '..', 'tester', 'browser.js')
          var dummyPath = path.join(__dirname, 'dummys/tester.js')
          if (app.testing) {
            b.require(testerPath, { expose: 'gaston-tester' })
          } else {
            b.require(dummyPath, { expose: 'gaston-tester' })
          }
          b.transform(require('./transforms/gaston-browser'))
        } else {
          b = browserify(requiresFile, bOptions)
        }
        if (!app.testing) {
          setAlias(b, app)
        }
        applyTransforms(b, app)

        if (!app.gaston.es5) {
          b.transform(babelify)
        }
        var blessify = self.blessify = new Blessify(app)
        b.transform(blessify.transform, { global: true })

        var pkgPath
        if (app.gaston.package) {
          pkgPath = path.join(project['base-path'], 'package.json')
        } else {
          pkgPath = path.join(__dirname, 'dummys', 'package.json')
        }
        b.require(pkgPath, { expose: 'package.json' })

        self.watchify = watchify(b)

        var onComplete = onBundleComplete(blessify, resolve, reject, self)
        var bundle = self.watchify.bundle(onComplete)
        self.smapify = new Smapify(app)
        bundle.on('data', self.smapify.buildMap)
      })
  })
}

var onBundleComplete = function (blessify, resolve, reject, bundler) {
  return function onBundleComplete (err, buf) {
    if (err) {
      bundler.watchify = null
      return reject(err)
    }

    var jsCode = buf.toString()

    blessify.render()
      .then(function (output) {
        resolve({
          js: jsCode,
          css: output.css,
          smaps: bundler.smapify.map,
          files: bundler.smapify.files
        })

        bundler.smapify.clear()
      })
      .catch(function (err) {
        bundler.watchify = null
        reject({
          originalCode: blessify.originalCode,
          lessCode: blessify.lessCode,
          error: err
        })
        blessify.clear()
      })
  }
}