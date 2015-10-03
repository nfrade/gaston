module.exports = function (projectPath) {
  var client = this
  return new Promise(function (resolve, reject) {
    client.socket.on('unregister-project', function (project) {
      resolve(project)
    })

    client.socket.emit('unregister-project', projectPath)
  })
}
