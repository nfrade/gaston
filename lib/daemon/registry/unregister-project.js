module.exports = function info (projectPath) {
  var socket = this
  var Config = global.Config
  var project = Config.projects[projectPath]

  project.unregister()
    .then(function () {
      socket.emit('unregister-project')
    })
}
