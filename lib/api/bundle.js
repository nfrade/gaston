module.exports = function bundle (options) {
  var client = this
  return client.connectedPromise || client.connect()
    .then(function () {
      return new Promise(function (resolve, reject) {
        client.socket.on('bundled', resolve)
        client.socket.on('errored', reject)

        client.socket.emit('bundle', options)
      })
    })
}
