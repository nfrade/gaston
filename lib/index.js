var Promise = require('bluebird')
  , fs = require('vigour-fs')
  // , npm = require('npm')
  , path = require('path')
  , log = require('npmlog')
  , mkdirp = require('mkdirp');

// Promise.promisifyAll(npm);
// npm.initAsync = Promise.promisify(npm.init);
Promise.promisifyAll(fs);
fs.existsAsync = function(file){
  return fs.statAsync(file)
    .then(function(stat){
      return true;
    })
    .catch(function(){
      return false;
    });
};

var config = require('./config')

var commandPath = path.join(__dirname, '..', 'commands', config.command + '.js');

fs.existsAsync(commandPath)
  .then(function(exists){
    if(!exists){
      log.error('gaston', config.command + ': no such command')
      log.info('gaston', 'type "gaston help" for help');
      process.exit(1);
    }

    require(commandPath)(config);
  });

mkdirp( path.join(config.basePath, 'bundles') );