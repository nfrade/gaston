#!/usr/bin/env node
var log = require('npmlog')
var fs = require('vigour-fs-promised')
var path = require('path')
var child_process = require('child_process')
var spawn = child_process.spawn
var Config = global.Config = require('../../config')
var homedir = process.env.USERPROFILE || process.env.HOME
var configPath = path.join(homedir, '.gaston', 'config.json')

module.exports = function(){
  return Config.init()
    .then(function () {
      return openEditor(configPath)
    })
    .then(function (content) {
      log.info('gaston', 'configuration changed')
    })
    // .then(validateNewContent)
    .then(function () {
      process.exit(0)
    })
}

function openEditor (file) {
  return new Promise(function (resolve, reject) {
    var cp = spawn(process.env.EDITOR || 'vim', [file], {
      stdio: [
        process.stdin,
        process.stdout,
        process.stderr
      ]
    })
    cp.on('exit', function () {
      fs.readFileAsync(file, 'utf8')
        .then(resolve)
    })
  })
}
