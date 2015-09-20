#!/usr/bin/env node
var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , child_process = require('child_process')
  , spawn = child_process.spawn
  , Config = global.Config = require('../lib/config')
  , client = require('../lib/io-client')
  , homedir = process.env.USERPROFILE || process.env.HOME
  , configPath = path.join(homedir, '.gaston', 'config.json')
  , config;

Config.init()
  .then(function(){
    return client.connect();
  })
  .then( makeBackup )
  .then(function(){
    return openEditor(configPath);
  })
  .then(function(content){
    console.log('content', content);
  })
  // .then(validateNewContent)
  .then(function(){
    process.exit(0);
  })
  .catch(function(){
    log.error('gaston', 'cannot connect to daemon');
    process.exit(1);
  });

function makeBackup(){
  return new Promise(function(resolve, reject){
    var rs = fs.createReadStream(configPath);
    var ws = fs.createWriteStream(configPath + '.backup');
    ws.on('close', resolve);
    rs.pipe( ws );
  });
}


function openEditor(file) {
  return new Promise(function(resolve, reject){
    var cp = spawn(process.env.EDITOR || 'vim', [file], {
      stdio: [
        process.stdin,
        process.stdout,
        process.stderr
      ]
    });
    cp.on('exit', function() {
      fs.readFileAsync(file, 'utf8')
        .then(resolve);
    });
  });
}
