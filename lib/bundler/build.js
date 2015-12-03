var path = require('path')
var browserify = require('browserify')
var uglifyJS = require('uglify-js')
var uglifyCSS = require('uglifycss')
var Blessify = require('gaston-blessify')
var Aliasify = require('gaston-aliasify')
var applyTransforms = require('./util/apply-transforms')
var babelify = require('./transforms/babelify')

// [TODO] setAlias not working here
module.exports = function build () {
  var self = this
  var app = self.app
  var project = app.project
  var blessify = self.blessify = new Blessify(app)
  var aliasify = new Aliasify(app)

  var bOptions = {
    debug: false,
    cache: {},
    packageCache: {},
    fullPaths: true,
    noParse: []
  }

  return new Promise(function (resolve, reject) {
    var b = browserify(app.source, bOptions)
    var pkgPath
    if (app.gaston.package) {
      pkgPath = path.join(project['base-path'], 'package.json')
      b.require(pkgPath, { expose: 'package.json' })
    }

    if(app.gaston.dist && app.gaston.dist.appcache){
      b.add(path.join(__dirname, '../..', 'gaston-files', 'appcache.js'))
    }

    if (!app.gaston.es5) {
      b.transform(babelify, {global: true})
    }
    b.transform(blessify.transform, { global: true })
    b.transform(aliasify.transform)
    applyTransforms(b, app)
    b.bundle(onComplete)

    function onComplete (err, buf) {
      if (err) {
        return reject(err)
      }
      var jsCode = buf.toString()
      jsCode = uglifyJS.minify(jsCode, {fromString: true})

      blessify.render()
        .then(function (output) {
          var cssCode = uglifyCSS.processString(output.css)
          resolve({
            js: jsCode.code,
            css: cssCode
          })
        })
        .catch(reject)
    }
  })
}
