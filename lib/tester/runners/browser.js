var log = require('npmlog')
var fs = require('vigour-fs-promised')
var path = require('path')
var _ = require('lodash')
var spawn = require('child_process').spawn
var Bundler = require('../../bundler')
var backtrackFile = require('../../utils/backtrack-file')
var getFiles = require('../utils/get-files')
var copyDependencies = require('../utils/copy-dependencies')
var tmpdir = require('os').tmpdir()
var dependencies = [
  'node_modules/mocha/mocha.js',
  'node_modules/mocha/mocha.css',
  'gaston-files/test-runner.html'
]

module.exports = function browser (options, errors, dir) {
  log.info('gaston tester', 'running browser tests from', options.source)

  return copyDependencies(dependencies, tmpdir)
    .then(function () {
      var getFilesPromise
      if (options.file) {
        getFilesPromise = getFiles(options.file)
      } else {
        getFilesPromise = getFiles(options.source, dir || 'browser')
      }
      return getFilesPromise
    })
    .then(function (files) {
      var Config = global.Config
      var browserFile = path.join(__dirname, '../browser.js')
      files.unshift(browserFile)
      var pkgPath = backtrackFile('package.json', options.source)

      if (!pkgPath) {
        throw Error('no package.json found')
      }

      return Config.registerProject(pkgPath, true)
        .then(function (project) {
          var app = {
            source: files,
            project: project,
            testing: true,
            gaston: _.merge({}, Config.gaston, project.pkg.gaston)
          }

          var bundler = new Bundler(app)
          return bundler.bundleTest()
        })
        .catch(function (err) {
          console.log(err.stack)
        })
    })
    .then(function (bundle) {
      var bundlePath = path.join(tmpdir, 'bundle.js')
      return fs.writeFileAsync(bundlePath, bundle.js, 'utf8')
    })
    .then(function () {
      return runTests(errors)
    })
}

var runTests = function runTests (errors) {
  return new Promise(function (resolve, reject) {
    var indexPath = path.join(tmpdir, 'test-runner.html')

    var mpjsPath = path.join(__dirname, '../../../', 'node_modules', '.bin', 'mocha-phantomjs')
    var exec = spawn(mpjsPath, [
      indexPath
    ])

    exec.stdout.pipe(process.stdout)

    exec.on('close', function (code, signal) {
      resolve(errors + code)
    })
  })
}
