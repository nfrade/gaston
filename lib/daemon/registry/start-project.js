module.exports = function info (projectPath) {
  var socket = this
  var Config = global.Config

  var project = Config.projects[projectPath]
  project.start()
    .then(function () {
      socket.emit('start-project')
    })
}
