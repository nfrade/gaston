var path = require('path')

module.exports = function getApp (apps, fullPath, basePath) {
  if (path.extname(fullPath)) {
    fullPath = path.dirname(fullPath) + '/'
  }
  var splitPath = fullPath.split('/')
  var testPath
  while (testPath !== basePath) {
    testPath = splitPath.join('/')
    if (apps[testPath]) {
      return apps[testPath]
    }
    splitPath.pop()
  }
}
