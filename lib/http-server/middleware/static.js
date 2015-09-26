var path = require('path')
var fs = require('vigour-fs-promised')

// [TODO] - add 'static-path' option to gaston config
module.exports = function (project) {
  var basePath = project['base-path']
  return function (req, res, next) {
    var filePath = path.join(basePath, req.url)
    fs.existsAsync(filePath)
      .then(function (exists) {
        if (exists) {
          fs.createReadStream(filePath)
            .pipe(res)
        } else {
          res.status(404, 'not found')
        }
      })
  }
}
