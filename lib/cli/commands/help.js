var fs = require('vigour-fs-promised')
var path = require('path')

module.exports = function (args) {
  var topic = args._[1] || 'cli'
  var helpPath = path.join(__dirname, '..', 'help', topic + '.txt')
  return fs.existsAsync(helpPath)
    .then(function (exists) {
      if (!exists) {
        return Promise.reject('no such topic ' + topic)
      }
      return new Promise(function (resolve, reject) {
        var rs = fs.createReadStream(helpPath)
        rs.on('end', resolve)
        rs.pipe(process.stdout)
      })
    })
}
