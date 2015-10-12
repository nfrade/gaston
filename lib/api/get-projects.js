module.exports = function () {
  var client = this
  return new Promise(function (resolve, reject) {
    client.socket.on('get-projects', function (projects) {
      resolve(projects)
    })

    client.socket.emit('get-projects')
  })
}
