var fs = require('vigour-fs-promised')
var backtrackFile = require('./backtrack-file')

module.exports = function (where) {
  var gitPath = backtrackFile('.git/HEAD', where)
  var branch = fs.readFileSync(gitPath, 'utf8').split('/').pop().trim()
  return branch
}
