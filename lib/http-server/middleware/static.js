var path = require('path')
var fs = require('vigour-fs-promised')

// [TODO] - add 'static-path' option to gaston config
module.exports = function (project) {
  var basePath = project['base-path']
  return function (req, res, next) {
    var pathArray = req.url.split('/')

    while (true) {
      var pathToTry = path.join(basePath, pathArray.join('/'))

      if (fs.existsSync(pathToTry)) {
        var stat = fs.statSync(pathToTry)
        if (!stat.isDirectory()) {
          return fs.createReadStream(pathToTry)
            .pipe(res)
        }
      }
      if (pathToTry === basePath) {
        return res.status(404).send('not found')
      }
      pathArray.shift()
    }
  }
}
