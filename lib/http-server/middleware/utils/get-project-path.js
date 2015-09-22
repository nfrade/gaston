var path = require('path')
var backtrackFile = require('../../../utils/backtrack-file')

module.exports = function getProjectPath (fullPath) {
  var packagePath = backtrackFile('package.json', fullPath)
  return path.dirname(packagePath)
}
