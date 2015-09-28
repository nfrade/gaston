var HttpServer = require('../../http-server')
var registerCurrent = require('./register-project').registerCurrent

module.exports = function (project) {
  project.httpServer = new HttpServer(project)
  return registerCurrent(project)
    .then(project.httpServer.start.bind(project.httpServer))
}
