var path = require('path')
var browserify = require('browserify')
var watchify = require('watchify')
var Blessify = require('gaston-blessify')
var Smapify = require('gaston-smapify')
var setAlias = require('./util/set-alias')
var applyTransforms = require('./util/apply-transforms')
var babelify = require('babelify')

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
    if (runGaston) {
      var gastonPath = path.join(__dirname, '..', 'browser', 'index.js')
      b = browserify(gastonPath, bOptions)
      b.require(app.source, { expose: 'index.js' })
      var testerPath = path.join(__dirname, '..', 'tester', 'browser.js')
      var dummyPath = path.join(__dirname, 'dummys/tester.js')
      if (app.testing) {
        b.require(testerPath, { expose: 'gaston-tester' })
      } else {
        b.require(dummyPath, { expose: 'gaston-tester' })
      }

      b.transform(require('./transforms/gaston-browser'))
       .transform(babelify.configure({
         whitelist: [
           'es6.arrowFunctions',
           'es6.blockScoping',
           'es6.classes',
           'es6.constants',
           'es6.parameters',
           'es6.properties.shorthand',
           'es6.properties.computed',
           'es6.destructuring',
           'es6.forOf',
           'es6.modules',
           'es6.spread',
           'es6.tailCall',
           'es6.templateLiterals',
           'es6.regex.unicode',
           'es6.regex.sticky',
           'regenerator'
         ]
       }))
    } else {
      b = browserify(app.source, bOptions)
    }

    if (!app.testing) {
      setAlias(b, app)
    }
    applyTransforms(b, app)

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
