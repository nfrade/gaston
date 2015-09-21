#!/usr/bin/env node
var path = require('path')
var fs = require('vigour-fs-promised')
var homedir = process.env.USERPROFILE || process.env.HOME
var configPath = path.join(homedir, '.gaston', 'config.json')
var initialConfig = {
  'http-port': 8080,
  'api-port': 64571,
  'base-path': process.env.HOME || process.env.USERPROFILE,
  'source-maps': false,
  'smaps': true,

  'push-state': false,
  'index-path': false,
  'css-compiler': 'less'
}

fs.existsAsync(configPath)
  .then(function (exists) {
    if (!exists) {
      fs.writeJSONAsync(configPath, initialConfig, { space: 2, mkdirp: true })
    }
  })
