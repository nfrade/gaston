var browserRunner = require('./browser')
var nodeRunner = require('./node')

module.exports = function common (options, errors, dir) {
  return browserRunner(options, errors, 'common')
    .then(function (errors) {
      return nodeRunner(options, errors, 'common')
    })
}
