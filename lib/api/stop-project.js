module.exports = function (projectPath) {
  var client = this
  return new Promise(function (resolve, reject) {
    client.socket.on('stop-project', function (project) {
      resolve(project)
    })

    client.socket.emit('stop-project', projectPath)
  })
}
