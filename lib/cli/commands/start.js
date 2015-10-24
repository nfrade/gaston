"use strict";
var path = require('path')
var project


module.exports = function start (args){
  var Config = global.Config

  return getProject()
    .then(startServices)
}

var startServices = function startServices(project){
  var services = project.pkg.gaston.start || {}
  var serviceKeys = Object.keys(services)
  for(let i = 0, l = serviceKeys.length; i < l; i++){
    var service = serviceKeys[i]
    var params = services[service]
    return startService(service, params)

  }
}

var startService = function startService(service, params){
    var child_process = require('child_process')
    var spawn = child_process.spawn

    var servicePath = path.join(project['base-path'], 'node_modules', '.bin', service)
    console.log(servicePath)
    var cp = spawn(servicePath, [params], {
      detached: true,
      stdio: [
        process.stdin,
        process.stdout,
        process.stderr
      ]
    })
    console.log('cped')
}

var getProject = function getProject(){
  var Project = require('../../config/models/project')
  var backtrackFile = require('../../utils/backtrack-file')

  var pkgPath = backtrackFile('package.json', process.cwd())
  project = new Project(pkgPath)
  return project.update()
}