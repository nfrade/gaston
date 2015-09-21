var Bundler = require('../../bundler')

module.exports = function build (options) {
  var socket = this
  var bundler = new Bundler(options)
  return bundler.build(options)
    .then(function (build) {
      socket.emit('build-complete', build)
    })
    .catch(function (err) {
      socket.emit('build-error', err.message || err)
    })
}
