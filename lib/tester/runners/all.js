var path = require('path')
var phantomRunner = require('./phantom')
var nodeRunner = require('./node')
var commonRunner = require('./common')

module.exports = function all (options, errors, dir) {
  options.source = path.join(options.source, 'phantom')
  return phantomRunner(options, errors)
    .then(function (errors) {
      options.source = options.source.replace('phantom', 'node')
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
