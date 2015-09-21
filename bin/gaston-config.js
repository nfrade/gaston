#!/usr/bin/env node
var log = require('npmlog')
var fs = require('vigour-fs-promised')
var path = require('path')
var child_process = require('child_process')
var spawn = child_process.spawn
var Config = global.Config = require('../lib/config')
var client = require('../lib/io-client')
var homedir = process.env.USERPROFILE || process.env.HOME
var configPath = path.join(homedir, '.gaston', 'config.json')

Config.init()
  .then(function () {
    return client.connect()
  })
  .then(makeBackup)
  .then(function () {
    return openEditor(configPath)
  })
  .then(function (content) {
    console.log('content', content)
  })
  // .then(validateNewContent)
  .then(function () {
    process.exit(0)
  })
  .catch(function () {
    log.error('gaston', 'cannot connect to daemon')
    process.exit(1)
  })

function makeBackup () {
  return new Promise(function (resolve, reject) {
    var rs = fs.createReadStream(configPath)
    var ws = fs.createWriteStream(configPath + '.backup')
    ws.on('close', resolve)
    rs.pipe(ws)
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
