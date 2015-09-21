var fs = require('vigour-fs-promised')
var path = require('path')
var replacer = require('./utils/replacer')
var parseLessError = require('./error-parsers/less')
var parseJsError = require('./error-parsers/javascript')
var gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
var errorPagePath = path.join(gastonFilesPath, 'error.html')

module.exports = function errorHandler (res, title) {
  return function (err) {
    var parsedError

    if (err.lessCode) {
      parsedError = parseLessError(err)
    } else {
      parsedError = parseJsError(err)
    }

    parsedError.title = 'ERR! ' + title

    fs.createReadStream(errorPagePath)
      .pipe(replacer(parsedError))
      .pipe(res)
  }
}
