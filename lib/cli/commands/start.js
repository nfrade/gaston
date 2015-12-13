var path = require('path')
var log = require('npmlog')
var openurl = require('openurl')
var Config = require('../../config')
var Daemon = require('../../daemon')
var Project = require('../../config/models/project')
var backtrackFile = require('../../utils/backtrack-file')
var assert = require('chai').assert

module.exports = function start (args) {
  var pkgPath = backtrackFile('package.json')
  var basePath = path.dirname(pkgPath)
  var pkg = require(pkgPath)
  log.info('gaston', 'launching project:', pkg.name)
  var project = new Project(pkgPath)
  var isTesting = args.t || args.test
  project.name = pkg.name

  return Config.init(true)
    .then(getPort)
    .then(Daemon.start)
    .then(() => { return args.p || args.port || pkg.gaston.port || getPort() })
    .then((port) => {
      project['http-port'] = port
      Config.startProject(project)
        .then((project) => {
          var devSource = args.s || args.source || (pkg.gaston && pkg.gaston.main) || pkg.main
          var testSource = args.s || args.source || (pkg.gaston && pkg.gaston.test)
          var ip = project.ip
          var url = `http://${project.ip}:${port}?`
          var errMsg = 'you have to specify path for the source, run gaston help start'
          try{
            if(isTesting){
              assert.ok(testSource)
              url += `$file=${testSource}&\$action=test`
            } else {
              assert.ok(testSource)
              url += `$file=${devSource}&\$action=dev`
            }
          } catch(ex){
            log.error('gaston', errMsg)
            process.exit(1)
          }

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