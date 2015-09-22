var path = require('path')

module.exports = function getApp (apps, fullPath, basePath) {
  if (path.extname(fullPath)) {
    fullPath = path.dirname(fullPath)
  }
  if (!fullPath.endsWith('/')) {
    fullPath += '/'
  }
  if (!basePath.endsWith('/')) {
    basePath += '/'
  }
  var splitPath = fullPath.split('/')
  var testPath
  while (testPath !== basePath) {
    testPath = splitPath.join('/') + '/'
    if (apps[testPath]) {
      return apps[testPath]
    }
    splitPath.pop()
  }
}
