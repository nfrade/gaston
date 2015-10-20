var path = require('path')
var fs = require('vigour-fs-promised')
var fileRegex = /parsing file\: ([\w|\/|\-|\_|\.]+)/
var messageRegexp = /\:\ (.+)(.+)/
var lineColumnRegexp = / (\(.+\))\swhile.+/
var lineRegexp = /\((\d+)/

module.exports = function parseJSError (err, app) {
  try {
    var errorFile = fileRegex.exec(err.message)[1]
    var lineColumn = lineColumnRegexp.exec(err.message)[1]
    var message = messageRegexp.exec(err.message)[1].replace(lineColumnRegexp, '')
    var lineInFile = lineRegexp.exec(lineColumn)[1]
    var code = fs.readFileSync(errorFile, 'utf8')
    var basePath = app.project['base-path']
    if(basePath[basePath.length -1] !== path.sep){
      basePath += path.sep
    }
    errorFile = errorFile.replace(basePath, '')

    return {
      errorType: 'JavaScript',
      syntax: 'javascript',
      message: message,
      file: errorFile,
      line: lineInFile,
      code: code
    }
  } catch (ex) {console.log(ex)
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
