module.exports = function info (projectPath) {
  var socket = this
  var Config = global.Config
  var project = Config.projects[projectPath]

  project.stop()
    .then(function () {
      socket.emit('stop-project')
    })
}
