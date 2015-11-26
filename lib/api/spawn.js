module.exports = function spawn (func, dirname) {
  var client = this.client
  return client.connectedPromise || client.connect()
    .then(function () {
    	console.log('connected')
      return new Promise(function (resolve, reject) {
        client.socket.on('bundled', resolve)
        client.socket.on('errored', reject)

        client.socket.emit('bundle', options)
      })
    })
    .catch((err) => console.error(err))
}