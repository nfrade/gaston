var path = require('path')

module.exports = function getApp (apps, fullPath, basePath) {
  if (!fullPath) {
    return
  }
  if (path.extname(fullPath)) {
    fullPath = path.dirname(fullPath)
  }
  if (fullPath[fullPath.length - 1] !== '/') {
    fullPath += '/'
  }
  if (basePath[basePath.length - 1] !== '/') {
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
