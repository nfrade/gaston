var path = require('path')
var phantomRunner = require('./browser')
var nodeRunner = require('./node')

module.exports = function all (options, errors, dir) {
  options.source = path.join(options.source, 'browser')
  return phantomRunner(options, errors)
    .then(function (errors) {
      options.source = options.source.replace('browser', 'node')
      return nodeRunner(options, errors)
    })
    .then(function (errors) {
      options.source = options.source.replace('node', 'common')
      return phantomRunner(options, errors)
    })
    .then(function (errors) {
      return nodeRunner(options, errors)
    })
}
