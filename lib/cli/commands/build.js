var log = require('npmlog')
var fs = require('vigour-fs-promised')
var path = require('path')
var gaston = require('../../')

module.exports = function build (args) {
  var cwd = process.cwd()
  var source = args.s || args.source
  if (source && source.indexOf('/') !== 0 && !~source.indexOf(cwd)) {
    source = path.join(cwd, source)
  }

  var pkgPath = args.p || args.package
  if (pkgPath && pkgPath.indexOf('/') !== 0 && !~pkgPath.indexOf(cwd)) {
    pkgPath = path.join(cwd, pkgPath)
  }

  var output = args.o || args.output
  if (output && output.indexOf('/') !== 0 && !~output.indexOf(cwd)) {
    output = path.join(cwd, output)
  }

  var indexPath = args.i || args['index-path']
  if (indexPath && indexPath.indexOf('/') !== 0 && !~indexPath.indexOf(cwd)) {
    indexPath = path.join(cwd, indexPath)
  }

  var options = {
    source: source || path.join(process.cwd(), 'index.js'),
    gaston: args.g || args.gaston || false,
    sourceMaps: args.m || args['source-maps'],
    package: pkgPath
  }

  return gaston.build(options)
    .then(function (build) {
      if (!output) {
        return exit(0)
      }

      return fs.statAsync(output)
        .then(function (stat) {
          if (!stat.isDirectory()) {
            return exit(1, 'output must be a directory')
          }

          var promises = [
            fs.writeFileAsync(path.join(output, 'build.js'), build.js, 'utf8'),
            fs.writeFileAsync(path.join(output, 'build.css'), build.css, 'utf8')
          ]

          if (indexPath) {
            var indexPromise = fs.readFileAsync(indexPath, 'utf8')
              .then(function (data) {
                data = data.replace('bundle.js', 'build.js')
                data = data.replace('bundle.css', 'build.css')
                fs.writeFileAsync(path.join(output, 'build.html'), data, 'utf8')
              })

            promises.push(indexPromise)
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
  log.info('gaston', 'build completed successfully')
  process.exit(code)
}
