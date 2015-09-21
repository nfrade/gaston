var phantomRunner = require('./phantom')
var nodeRunner = require('./node')
var commonRunner = require('./common')

module.exports = function all (source, errors, dir) {
  return phantomRunner(source, errors)
    .then(function (errors) {
      return nodeRunner(source, errors)
    })
    .then(function (errors) {
      return commonRunner(source, errors)
    })
}
