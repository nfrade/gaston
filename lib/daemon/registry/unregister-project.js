module.exports = function info (projectPath) {
  var socket = this
  var Config = global.Config
  var project = Config.projects[projectPath]

  // [TODO] find out why project isn't Project instance when you register in this session
  if (!project.unregister) {
    return socket.emit('unregister-project')
  }
  project.unregister()
    .then(function () {
      socket.emit('unregister-project')
    })
}
