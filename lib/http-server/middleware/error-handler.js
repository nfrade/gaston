var fs = require('vigour-fs-promised')
var path = require('path')
var replacer = require('../../utils/replacer')
var parseLessError = require('./error-parsers/less')
var parseJsError = require('./error-parsers/javascript')
var gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
var errorPagePath = path.join(gastonFilesPath, 'error.html')

module.exports = function errorHandler (err, app) {
  var parsedError

  if (err.lessCode) {
    parsedError = parseLessError(err, app)
  } else {
    parsedError = parseJsError(err, app)
  }

  parsedError.title = 'ERR! ' + app.title + '-' + app.name

  fs.createReadStream(errorPagePath)
    .pipe(replacer(parsedError))
    .pipe(app.res)
}
