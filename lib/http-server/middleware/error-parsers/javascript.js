var fs = require('vigour-fs-promised')
var fileRegex = /parsing file\: ([\w|\/|\-|\_|\.]+)/
var messageRegexp = /(.+)\(/
var lineColumnRegexp = / (\(.+\))\s\(/
var lineRegexp = /\((\d+)/

module.exports = function parseLessError (err) {
  try {
    var errorFile = fileRegex.exec(err.message)[1]
    var lineColumn = lineColumnRegexp.exec(err.message)[1]
    var message = messageRegexp.exec(err.message)[1].replace(lineColumn, '')
    var lineInFile = lineRegexp.exec(lineColumn)[1]
    var code = fs.readFileSync(errorFile, 'utf8')

    return {
      errorType: 'JavaScript',
      syntax: 'javascript',
      message: message,
      file: errorFile,
      line: lineInFile,
      code: code
    }
  } catch (ex) {
    return ex && {
      errorType: 'JavaScript',
      syntax: 'javascript',
      message: err.message,
      file: ' ',
      line: ' ',
      code: ' '
    }
  }
}
