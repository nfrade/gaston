var phantomRunner = require('./phantom')
var nodeRunner = require('./node')

module.exports = function common (options, errors, dir) {
  return phantomRunner(options, errors, 'common')
    .then(function (errors) {
      return nodeRunner(options, errors, 'common')
    })
}
