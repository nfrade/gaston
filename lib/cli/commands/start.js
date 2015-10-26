"use strict";
var path = require('path')
var child_process = require('child_process')
var fork = child_process.fork
var log = require('npmlog')
var getport = require('getport')
var project


module.exports = function start (args){console.log('starting')
  var Config = global.Config

  return getProject()
    .then(startServices)
    .then(startGaston)
}

var startGaston = function startGaston (project){
  // getport(9000, function(e, port){
  //   project['http-port'] = port
  //   return project.start()
  //     .then(function(){
  //       var open = require('open')
  //       var toOpen = 'http://' + project.ip + ':'+ port +'/'
  //       open(toOpen)
  //     })
  // })
  require('../../../bin/gastond')
}

var startServices = function startServices(project){
  var services = project.pkg.gaston.start || {}
  var serviceKeys = Object.keys(services)
  for(let i = 0, l = serviceKeys.length; i < l; i++){
    var service = serviceKeys[i]
    var params = services[service]
    startService(service, params)
  }
  return project
}

var startService = function startService(service, params){
  params = params.split(' ')
  var servicePath = path.join(project['base-path'], 'node_modules', '.bin', service)
  var cp = fork(servicePath, params, {
    stdio: [
      process.stdin,
      process.stdout,
      process.stderr
    ]
  })

  cp.on('message', function(msg){ console.log('got message')
    if(msg === 'ready'){
      log.info('started:', service)
    }
  })
}

var getProject = function getProject(){
  var Project = require('../../config/models/project')
  var backtrackFile = require('../../utils/backtrack-file')

  var pkgPath = backtrackFile('package.json', process.cwd())
  project = new Project(pkgPath)
  return project.update()
}