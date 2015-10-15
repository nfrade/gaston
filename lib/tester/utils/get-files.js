var fs = require('vigour-fs-promised')
var path = require('path')

module.exports = function getFiles (source, runner) {
  if (path.extname(source) === '.js') {
    return Promise.resolve([source])
  }
  var basePath = source
  var files = []

  if (path.extname(basePath)) {
    var file = basePath
    if (!~file.indexOf(basePath)) {
      file = path.join(basePath, file)
    }
    files.push(file)
    return Promise.resolve(files)
  }

  if (!fs.existsSync(basePath)) {
    return Promise.resolve(files)
  }

  (function recur (base) {
    var list = fs.readdirSync(base)
    for (var i = 0, l = list.length; i < l; i++) {
      var file = path.join(base, list[i])
      if (path.extname(file) === '.js') {
        files.push(file)
      }
      var stat = fs.statSync(file)
      if (stat.isDirectory(file)) {
        recur(file)
      }
    }
  })(basePath)

  return Promise.resolve(files)
}
// [TODO] turn this into async
