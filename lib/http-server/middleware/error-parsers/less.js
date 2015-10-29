"use strict";

var path = require('path')
var fileLineRegex = /\/\*\ file: ([\w|\/|\-|\_|\.]+)/

module.exports = function parseLessError (errorObj, app) {
  var err = errorObj.error
  var lessCode = errorObj.originalCode
  var lines = lessCode.split('\n')
  var errorLine = err.line - 1
  var errorFile
  var lineInFile
  var fileLine

  var i, l
  for (i = errorLine - 1; i >= 0; i--) {
    fileLine = lines[i]

    let match = fileLineRegex.exec(fileLine)

    if (match) {
      fileLine = i
      errorFile = match[1]
      lineInFile = errorLine - fileLine
      break
    }
  }

  var code = ''
  for (i = fileLine + 1, l = lines.length; i < l; i++) {
    let line = lines[i]
    if (fileLineRegex.exec(line)) {
      break
    }
    if (i !== fileLine + 1) {
      code += '\n'
    }
    code += line
  }

  var basePath = app.project['base-path']
  if(basePath[basePath.length -1] !== path.sep){
    basePath += path.sep
  }
  errorFile = errorFile.replace(basePath, '')

  return {
    errorType: 'Less',
    syntax: 'less',
    file: errorFile,
    line: lineInFile,
    message: err.message,
    code: code
  }
}
