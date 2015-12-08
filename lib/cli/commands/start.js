var path = require('path')
var log = require('npmlog')
var openurl = require('openurl')
var Config = require('../../config')
var Daemon = require('../../daemon')
var Project = require('../../config/models/project')
var backtrackFile = require('../../utils/backtrack-file')

module.exports = function start (args) {
  var pkgPath = backtrackFile('package.json')
  var basePath = path.dirname(pkgPath)
  var pkg = require(pkgPath)
  log.info('gaston', 'launching project:', pkg.name)
  var main = (pkg.gaston && pkg.gaston.main) || pkg.main
  var project = new Project(pkgPath)
  project.name = pkg.name

  Config.init(true)
    .then(getPort)
    .then(Daemon.start)
    .then(getPort)
    .then((port) => {
      project['http-port'] = port
      Config.startProject(project)
        .then((project) => {
          var ip = project.ip
          var url = `http://${project.ip}:${port}?\$file=${main}&\$action=dev`
          openurl.open(url)
        })
    })
}

var getPort = function(){
  return new Promise((resolve, reject) => {
    var server = require('net').createServer()
    server.unref();
    server.on('error', reject)
    server.listen(0, () => {
      resolve(server.address().port)
      server.close()
    })
  })
}