var fs = require('vigour-fs-promised')
path = require('path')

module.exports = function (args) {
  var topic = args._[1]

  console.log('topic', topic)
}
